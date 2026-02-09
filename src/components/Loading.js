export default function Loading({ fullScreen = true, size = 'default' }) {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    default: 'h-12 w-12 border-4',
    large: 'h-16 w-16 border-4',
  }

  const spinner = (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-blue-500 border-t-transparent`} />
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    )
  }

  return spinner
}