import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"

export enum ElementCategory {
  BASIC = "basic",
  GENERAL = "general",
  INDUSTRIAL = "industrial",
}

export enum ElementType {
  CUBE = "cube",
  PRISM = "prism",
  CYLINDER = "cylinder",
  TEXT = "text",
  PLANE = "plane",
  LINE = "line",
  API = "api",
  BROWSER = "browser",
  CACHE = "cache",
  CALCULATOR = "calculator",
  CODE = "code",
  CRON_JOB = "cron_job",
  DATA_ANALYSIS = "data_analysis",
  DOWNLOAD = "download",
  EMAIL = "email",
  // 工业组件
  TRANSFORMER = "transformer",
  GENERATOR = "generator",
  SOLAR_PANEL = "solar_panel",
  BATTERY = "battery",
  POWER_LINE = "power_line",
  SWITCH = "switch",
  CIRCUIT_BREAKER = "circuit_breaker",
  SUBSTATION = "substation",
}

export interface Element {
  id: string
  type: ElementType
  name: string
  position: {
    x: number
    y: number
    z: number
  }
  rotation: {
    x: number
    y: number
    z: number
  }
  scale: number
  material: string
  color?: string
  displayTip: boolean
  tipHeight?: number
  tipColor?: string
  connections?: string[] // 连接到的其他元素ID
  properties?: Record<string, any> // 元素特定属性
}

interface ElementStore {
  elements: Element[]
  selectedElement: Element | null
  addElement: (element: Omit<Element, "id">) => void
  updateElement: (id: string, updates: Partial<Element>) => void
  removeElement: (id: string) => void
  setSelectedElement: (element: Element | null) => void
  duplicateElement: (id: string) => void
  clearElements: () => void
  loadElements: (elements: Element[]) => void
  connectElements: (sourceId: string, targetId: string) => void
  disconnectElements: (sourceId: string, targetId: string) => void
}

export const useElementStore = create<ElementStore>((set) => ({
  elements: [
    {
      id: uuidv4(),
      type: ElementType.PRISM,
      name: "Prism",
      position: { x: -2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1,
      material: "standard",
      color: "#4080ff",
      displayTip: false,
    },
    {
      id: uuidv4(),
      type: ElementType.CYLINDER,
      name: "Cylinder",
      position: { x: 2, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1,
      material: "standard",
      color: "#ffffff",
      displayTip: false,
    },
  ],
  selectedElement: null,

  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, { ...element, id: uuidv4() }],
    })),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((element) => (element.id === id ? { ...element, ...updates } : element)),
      selectedElement:
        state.selectedElement?.id === id ? { ...state.selectedElement, ...updates } : state.selectedElement,
    })),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((element) => element.id !== id),
      selectedElement: state.selectedElement?.id === id ? null : state.selectedElement,
    })),

  setSelectedElement: (element) => set({ selectedElement: element }),

  duplicateElement: (id) =>
    set((state) => {
      const elementToDuplicate = state.elements.find((element) => element.id === id)
      if (!elementToDuplicate) return state

      const newElement = {
        ...elementToDuplicate,
        id: uuidv4(),
        position: {
          x: elementToDuplicate.position.x + 1,
          y: elementToDuplicate.position.y,
          z: elementToDuplicate.position.z + 1,
        },
        name: `${elementToDuplicate.name} Copy`,
      }

      return {
        elements: [...state.elements, newElement],
      }
    }),

  clearElements: () => set({ elements: [], selectedElement: null }),

  loadElements: (elements) => set({ elements, selectedElement: null }),

  connectElements: (sourceId, targetId) =>
    set((state) => {
      const updatedElements = state.elements.map((element) => {
        if (element.id === sourceId) {
          const connections = element.connections || []
          if (!connections.includes(targetId)) {
            return { ...element, connections: [...connections, targetId] }
          }
        }
        return element
      })

      return { elements: updatedElements }
    }),

  disconnectElements: (sourceId, targetId) =>
    set((state) => {
      const updatedElements = state.elements.map((element) => {
        if (element.id === sourceId && element.connections) {
          return {
            ...element,
            connections: element.connections.filter((id) => id !== targetId),
          }
        }
        return element
      })

      return { elements: updatedElements }
    }),
}))
