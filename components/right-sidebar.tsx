"use client"
import { useElementStore } from "@/lib/element-store"
import { ChevronLeft, Info } from "lucide-react"
import { ElementIcon } from "./element-icon"
import { CuboidIcon as Cube } from "lucide-react"

interface RightSidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export function RightSidebar({ collapsed, setCollapsed }: RightSidebarProps) {
  const { selectedElement, updateElement } = useElementStore()

  if (collapsed) {
    return (
      <div className="w-10 bg-white shadow-md flex flex-col items-center py-4 h-full">
        <button onClick={() => setCollapsed(false)} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft />
        </button>
      </div>
    )
  }

  return (
    <div className="w-64 bg-white shadow-md flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Cube className="h-5 w-5" />
          <h2 className="font-semibold">场景元素</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 rounded-full hover:bg-gray-100">
            <Info className="h-4 w-4" />
          </button>
          <button className="p-1 rounded-full hover:bg-gray-100">
            <ChevronLeft onClick={() => setCollapsed(true)} className="h-4 w-4" />
          </button>
        </div>
      </div>

      {selectedElement ? (
        <div className="p-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <ElementIcon type={selectedElement.type} size={20} />
            <h3 className="font-medium">{selectedElement.name}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">名称</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={selectedElement.name}
                onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">缩放</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={selectedElement.scale}
                step={0.1}
                min={0.1}
                onChange={(e) => updateElement(selectedElement.id, { scale: Number.parseFloat(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">材质类型</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "standard", name: "标准" },
                  { id: "basic", name: "基础" },
                  { id: "phong", name: "高光" },
                  { id: "physical", name: "物理" },
                  { id: "toon", name: "卡通" },
                  { id: "normal", name: "法线" },
                ].map((material) => (
                  <button
                    key={material.id}
                    className={`p-2 border rounded ${selectedElement.material === material.id ? "bg-blue-500 text-white" : "bg-white"}`}
                    onClick={() => updateElement(selectedElement.id, { material: material.id })}
                  >
                    <div
                      className="w-6 h-6 rounded-full mx-auto"
                      style={{
                        background:
                          material.id === "standard"
                            ? "#f0f0f0"
                            : material.id === "basic"
                              ? "#d0d0d0"
                              : material.id === "phong"
                                ? "#a0a0a0"
                                : material.id === "physical"
                                  ? "#707070"
                                  : material.id === "toon"
                                    ? "#404040"
                                    : "#202020",
                      }}
                    />
                    <div className="text-xs mt-1">{material.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">旋转 X</label>
              <input
                type="range"
                className="w-full"
                min={0}
                max={360}
                value={selectedElement.rotation.x}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    rotation: { ...selectedElement.rotation, x: Number.parseInt(e.target.value) },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm mb-1">旋转 Y</label>
              <input
                type="range"
                className="w-full"
                min={0}
                max={360}
                value={selectedElement.rotation.y}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    rotation: { ...selectedElement.rotation, y: Number.parseInt(e.target.value) },
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm mb-1">旋转 Z</label>
              <input
                type="range"
                className="w-full"
                min={0}
                max={360}
                value={selectedElement.rotation.z}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    rotation: { ...selectedElement.rotation, z: Number.parseInt(e.target.value) },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="block text-sm">显示标签</label>
              <div className="relative inline-block w-10 align-middle select-none">
                <input
                  type="checkbox"
                  name="toggle"
                  id="toggle"
                  className="sr-only"
                  checked={selectedElement.displayTip}
                  onChange={(e) => updateElement(selectedElement.id, { displayTip: e.target.checked })}
                />
                <label
                  htmlFor="toggle"
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                    selectedElement.displayTip ? "bg-blue-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                      selectedElement.displayTip ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </label>
              </div>
            </div>

            {selectedElement.displayTip && (
              <>
                <div>
                  <label className="block text-sm mb-1">标签高度</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={selectedElement.tipHeight || 1.6}
                    step={0.1}
                    min={0.1}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { tipHeight: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">标签颜色</label>
                  <input
                    type="color"
                    className="w-full p-1 border rounded h-10"
                    value={selectedElement.tipColor || "#ffffff"}
                    onChange={(e) => updateElement(selectedElement.id, { tipColor: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          <p>未选中元素</p>
          <p className="text-sm">点击场景中的元素来编辑其属性</p>
        </div>
      )}
    </div>
  )
}
