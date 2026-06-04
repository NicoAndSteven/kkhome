/**
 * 加载中组件 - TECH_PRO 深色技术风格
 * 深色风格加载动画
 */
const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      {/* 旋转动画 - primary 色 */}
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-2 border-primary/30 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin" />
      </div>
      
      {/* 加载文字 */}
      <p className="mt-4 text-text-muted text-sm font-label-mono">
        Loading...
      </p>
    </div>
  )
}

export default Loading
