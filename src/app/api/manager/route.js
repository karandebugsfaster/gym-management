import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { verifyAuth } from "@/lib/middleware";
import User from "@/models/User";
import Gym from "@/models/Gym";
import bcrypt from "bcryptjs";

// GET - Fetch all managers for a gym owner
export async function GET(req) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await dbConnect();

    // Only owners can fetch managers
    const owner = await User.findById(authResult.userId);
    if (!owner || owner.role !== "owner") {
      return NextResponse.json(
        { success: false, message: "Only gym owners can view managers" },
        { status: 403 },
      );
    }

    // Fetch all managers created by this owner
    const managers = await User.find({
      assignedBy: authResult.userId,
      role: "manager",
      isActive: true,
    })
      .populate("managedGyms", "name location")
      .select("-password")
      .lean();

    return NextResponse.json({
      success: true,
      managers,
    });
  } catch (error) {
    console.error("Error fetching managers:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

// POST - Create a new manager
export async function POST(req) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { name, email, password, phoneNumber, dialCode, gymIds } = body;

    // Validation
    if (!name || !email || !password || !phoneNumber) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Only owners can create managers
    const owner = await User.findById(authResult.userId);
    if (!owner) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Check if user is owner (not manager)
    if (owner.role === "manager") {
      return NextResponse.json(
        { success: false, message: "Only gym owners can create managers" },
        { status: 403 },
      );
    }
    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 },
      );
    }

    // Verify that gymIds belong to this owner
    if (gymIds && gymIds.length > 0) {
      const gyms = await Gym.find({
        _id: { $in: gymIds },
        owner: authResult.userId,
      });

      if (gyms.length !== gymIds.length) {
        return NextResponse.json(
          { success: false, message: "Invalid gym selection" },
          { status: 400 },
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create manager
    const manager = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber,
      dialCode: dialCode || "91",
      role: "manager",
      managedGyms: gymIds || [],
      assignedBy: authResult.userId,
      isActive: true,
    });

    // Return manager without password
    const managerData = await User.findById(manager._id)
      .populate("managedGyms", "name location")
      .select("-password")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Manager created successfully",
      manager: managerData,
    });
  } catch (error) {
    console.error("Error creating manager:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 },
    );
  }
}

// PUT - Update manager
export async function PUT(req) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { managerId, name, phoneNumber, gymIds, isActive } = body;

    if (!managerId) {
      return NextResponse.json(
        { success: false, message: "Manager ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Only owners can update their managers
    const owner = await User.findById(authResult.userId);
    if (!owner || owner.role !== "owner") {
      return NextResponse.json(
        { success: false, message: "Only gym owners can update managers" },
        { status: 403 },
      );
    }

    // Verify manager belongs to this owner
    const manager = await User.findOne({
      _id: managerId,
      assignedBy: authResult.userId,
      role: "manager",
    });

    if (!manager) {
      return NextResponse.json(
        { success: false, message: "Manager not found" },
        { status: 404 },
      );
    }

    // Update fields
    const updateData = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (gymIds) updateData.managedGyms = gymIds;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedManager = await User.findByIdAndUpdate(
      managerId,
      { $set: updateData },
      { new: true },
    )
      .populate("managedGyms", "name location")
      .select("-password");

    return NextResponse.json({
      success: true,
      message: "Manager updated successfully",
      manager: updatedManager,
    });
  } catch (error) {
    console.error("Error updating manager:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

// DELETE - Deactivate manager
export async function DELETE(req) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");

    if (!managerId) {
      return NextResponse.json(
        { success: false, message: "Manager ID is required" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Only owners can delete their managers
    const owner = await User.findById(authResult.userId);
    if (!owner || owner.role !== "owner") {
      return NextResponse.json(
        { success: false, message: "Only gym owners can delete managers" },
        { status: 403 },
      );
    }

    // Soft delete (deactivate)
    const manager = await User.findOneAndUpdate(
      {
        _id: managerId,
        assignedBy: authResult.userId,
        role: "manager",
      },
      { $set: { isActive: false } },
      { new: true },
    );

    if (!manager) {
      return NextResponse.json(
        { success: false, message: "Manager not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Manager deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting manager:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
