import * as React from "react"
import { useTheme } from "next-themes"

export function SimpleThemeTest() {
  const { theme, setTheme } = useTheme()
  
  React.useEffect(() => {
    console.log('Current theme:', theme)
  }, [theme])

  return (
    <div className="p-4 border rounded">
      <p className="mb-2">Current theme: {theme}</p>
      <div className="space-x-2">
        <button 
          onClick={() => setTheme('light')}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
        >
          Light
        </button>
        <button 
          onClick={() => setTheme('dark')}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
        >
          Dark
        </button>
        <button 
          onClick={() => setTheme('system')}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
        >
          System
        </button>
      </div>
    </div>
  )
}
