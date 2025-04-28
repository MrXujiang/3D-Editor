"use client"

import type React from "react"

import {
  Folder,
  Pencil,
  ImageIcon,
  Grid3X3,
  Box,
  Link,
  Paperclip,
  Share,
  Save,
  Maximize,
  Undo,
  Redo,
  Copy,
  Scissors,
  Clipboard,
  HelpCircle,
  FileDown,
  FileUp,
  FilePlus,
  Trash2,
  Settings2,
  LayoutGrid,
} from "lucide-react"
import { useState } from "react"
import { useElementStore } from "@/lib/element-store"

interface TopToolbarProps {
  viewMode: "3D" | "2D"
  setViewMode: (mode: "3D" | "2D") => void
  onUndo: () => void
  onRedo: () => void
}

export function TopToolbar({ viewMode, setViewMode, onUndo, onRedo }: TopToolbarProps) {
  const { selectedElement, elements, addElement, updateElement, clearElements, loadElements } = useElementStore()
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [showEditMenu, setShowEditMenu] = useState(false)
  const [showViewMenu, setShowViewMenu] = useState(false)
  const [showHelpMenu, setShowHelpMenu] = useState(false)
  const [projectName, setProjectName] = useState("未命名.i3d")
  const [isEditingName, setIsEditingName] = useState(false)
  const [gridVisible, setGridVisible] = useState(true)

  // 处理文件菜单操作
  const handleFileOperation = (operation: string) => {
    switch (operation) {
      case "new":
        if (confirm("创建新项目将清除当前工作区，确定继续吗？")) {
          clearElements()
          setProjectName("未命名.i3d")
        }
        break
      case "save":
        saveProject()
        break
      case "load":
        document.getElementById("file-upload")?.click()
        break
      case "export":
        exportScene()
        break
      default:
        break
    }
    setShowFileMenu(false)
  }

  // 处理编辑菜单操作
  const handleEditOperation = (operation: string) => {
    switch (operation) {
      case "undo":
        onUndo()
        break
      case "redo":
        onRedo()
        break
      case "copy":
        if (selectedElement) {
          // 将选中元素信息存储到localStorage
          localStorage.setItem("copiedElement", JSON.stringify(selectedElement))
        }
        break
      case "paste":
        const copiedElement = localStorage.getItem("copiedElement")
        if (copiedElement) {
          const element = JSON.parse(copiedElement)
          // 创建一个新的ID并稍微偏移位置
          addElement({
            ...element,
            position: {
              x: element.position.x + 1,
              y: element.position.y,
              z: element.position.z + 1,
            },
          })
        }
        break
      case "delete":
        // 删除选中元素的逻辑已在FloatingToolbar中实现
        break
      default:
        break
    }
    setShowEditMenu(false)
  }

  // 处理视图菜单操作
  const handleViewOperation = (operation: string) => {
    switch (operation) {
      case "3D":
        setViewMode("3D")
        break
      case "2D":
        setViewMode("2D")
        break
      case "grid":
        setGridVisible(!gridVisible)
        break
      default:
        break
    }
    setShowViewMenu(false)
  }

  // 保存项目
  const saveProject = () => {
    const projectData = {
      name: projectName,
      elements: elements,
      version: "1.0",
    }

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${projectName}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 导出场景
  const exportScene = () => {
    // 这里可以实现导出为其他格式的逻辑，如GLTF、OBJ等
    alert("导出功能正在开发中...")
  }

  // 加载项目
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const projectData = JSON.parse(e.target?.result as string)
          setProjectName(projectData.name || "已加载.i3d")

          // 加载元素
          if (Array.isArray(projectData.elements)) {
            loadElements(projectData.elements)
          } else {
            throw new Error("Invalid project format")
          }
        } catch (error) {
          alert("无法加载项目文件，格式可能不正确。")
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="h-14 bg-white border-b flex items-center px-4 justify-between">
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => {
              setShowFileMenu(!showFileMenu)
              setShowEditMenu(false)
              setShowViewMenu(false)
              setShowHelpMenu(false)
            }}
          >
            <Folder className="h-5 w-5" />
          </button>
          {showFileMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-50 w-48">
              <button
                className="w-full text-left p-2 hover:bg-gray-100 flex items-center"
                onClick={() => handleFileOperation("new")}
              >
                <FilePlus className="h-4 w-4 mr-2" />
                新建项目
              </button>
              <button
                className="w-full text-left p-2 hover:bg-gray-100 flex items-center"
                onClick={() => handleFileOperation("save")}
              >
                <Save className="h-4 w-4 mr-2" />
                保存项目
              </button>
              <button
                className="w-full text-left p-2 hover:bg-gray-100 flex items-center"
                onClick={() => handleFileOperation("load")}
              >
                <FileUp className="h-4 w-4 mr-2" />
                加载项目
              </button>
              <button
                className="w-full text-left p-2 hover:bg-gray-100 flex items-center"
                onClick={() => handleFileOperation("export")}
              >
                <FileDown className="h-4 w-4 mr-2" />
                导出场景
              </button>
              <input id="file-upload" type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => {
              setShowEditMenu(!showEditMenu)
              setShowFileMenu(false)
              setShowViewMenu(false)
              setShowHelpMenu(false)
            }}
          >
            <Pencil className="h-5 w-5" />
          </button>
          {showEditMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-50 w-48">
              <button
                className="w-full text-left p-2 hover:bg-gray-100 flex items-center"
                onClick={() => handleEditOperation("undo")}
              >
                <Undo className="h-4 w-4 mr-2" />
                撤销
                <span className="ml-auto text-xs text-gray-500">Ctrl+Z</span>
              </button>
              <button
                className="w-full text-left p-2 hover:bg-gray-100 flex items-center"
                onClick={() => handleEditOperation("redo")}
              >
                <Redo className="h-4 w-4 mr-2" />
                重做
                <span className="ml-auto text-xs text-gray-500">Ctrl+Y</span>
              </button>
              <div className="border-t my-1"></div>
              <button
                className="w-full text-left p-2 hover:bg-gray-100 flex items-center"
                onClick={() => handleEditOperation("copy")}
                disabled={!selectedElement}
              >
                <Copy className="h-4 w-4 mr-2" />
                复制
                <span className="ml-auto text-xs text-gray-500">Ctrl+C</span>
              </button>
              <button
                className="w-full text-left p-2 hover:bg-gray-100 flex items-center"
                onClick={() => handleEditOperation("cut")}
                disabled={!selectedElement}
              >
                <Scissors className="h-4 w-4 mr-2" />
                剪切
                <span className="ml-auto text-xs text-gray-500">Ctrl+X</span>
              </button>
              <button
                className="w-full text-left p-2 hover:bg-gray-100 flex items-center"
                onClick={() => handleEditOperation("paste")}
              >
                <Clipboard className="h-4 w-4 mr-2" />
                粘贴
                <span className="ml-auto text-xs text-gray-500">Ctrl+V</span>
              </button>
              <button
                className="w-full text-left p-2 hover:bg-gray-100 flex items-center"
                onClick={() => handleEditOperation("delete")}
                disabled={!selectedElement}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
                <span className="ml-auto text-xs text-gray-500">Delete</span>
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => {
              setShowViewMenu(!showViewMenu)
              setShowFileMenu(false)
              setShowEditMenu(false)
              setShowHelpMenu(false)
            }}
          >
            <ImageIcon className="h-5 w-5" />
          </button>
          {showViewMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-50 w-48">
              <button
                className="w-full text-left p-2 hover:bg-gray-100 flex items-center"
                onClick={() => handleViewOperation("3D")}
              >
                <Box className="h-4 w-4 mr-2" />
                3D视图
                {viewMode === "3D" && <span className="ml-auto text-green-500">✓</span>}
              </button>
              <button
                className="w-full text-left p-2 hover:bg-gray-100 flex items-center"
                onClick={() => handleViewOperation("2D")}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                2D视图
                {viewMode === "2D" && <span className="ml-auto text-green-500">✓</span>}
              </button>
              <button
                className="w-full text-left p-2 hover:bg-gray-100 flex items-center"
                onClick={() => handleViewOperation("grid")}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                显示网格
                {gridVisible && <span className="ml-auto text-green-500">✓</span>}
              </button>
            </div>
          )}
        </div>

        <button className="p-2 rounded-full hover:bg-gray-100">
          <Box className="h-5 w-5" />
        </button>

        <button className="p-2 rounded-full hover:bg-gray-100">
          <Settings2 className="h-5 w-5" />
        </button>

        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => {
              setShowHelpMenu(!showHelpMenu)
              setShowFileMenu(false)
              setShowEditMenu(false)
              setShowViewMenu(false)
            }}
          >
            <HelpCircle className="h-5 w-5" />
          </button>
          {showHelpMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-50 w-64">
              <div className="p-3">
                <h3 className="font-bold mb-2">快捷键</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Ctrl+Z</div>
                  <div>撤销</div>
                  <div>Ctrl+Y</div>
                  <div>重做</div>
                  <div>Delete</div>
                  <div>删除选中元素</div>
                  <div>Ctrl+C</div>
                  <div>复制</div>
                  <div>Ctrl+V</div>
                  <div>粘贴</div>
                  <div>Ctrl+X</div>
                  <div>剪切</div>
                  <div>Ctrl+S</div>
                  <div>保存项目</div>
                </div>
              </div>
              <div className="p-3 border-t">
                <h3 className="font-bold mb-2">关于</h3>
                <p className="text-sm">i3D Editor v1.0</p>
                <p className="text-sm">工业3D可视化编辑器</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center">
        {isEditingName ? (
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
            className="border rounded px-2 py-1"
            autoFocus
          />
        ) : (
          <div className="flex items-center" onClick={() => setIsEditingName(true)}>
            <span className="text-gray-500 mx-2">•</span>
            <span>{projectName}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Link className="h-5 w-5" />
        </button>

        <button className="p-2 rounded-full hover:bg-gray-100">
          <Paperclip className="h-5 w-5" />
        </button>

        <button className="p-2 rounded-full hover:bg-gray-100">
          <Share className="h-5 w-5" />
        </button>

        <button className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600" onClick={saveProject}>
          <Save className="h-5 w-5" />
        </button>

        <button className="p-2 rounded-full hover:bg-gray-100">
          <Maximize className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
