import {
  CuboidIcon as Cube,
  Hexagon,
  CylinderIcon,
  Type,
  Square,
  LineChart,
  Workflow,
  Globe,
  Zap,
  CalculatorIcon,
  CodeIcon,
  Clock,
  PieChart,
  Download,
  Mail,
  Lightbulb,
  Battery,
  Sun,
  Power,
  Cable,
  ToggleLeft,
  CircuitBoard,
  Building2,
} from "lucide-react"
import { ElementType } from "@/lib/element-store"

interface ElementIconProps {
  type: ElementType
  size?: number
}

export function ElementIcon({ type, size = 24 }: ElementIconProps) {
  switch (type) {
    case ElementType.CUBE:
      return <Cube size={size} />
    case ElementType.PRISM:
      return <Hexagon size={size} />
    case ElementType.CYLINDER:
      return <CylinderIcon size={size} />
    case ElementType.TEXT:
      return <Type size={size} />
    case ElementType.PLANE:
      return <Square size={size} />
    case ElementType.LINE:
      return <LineChart size={size} />
    case ElementType.API:
      return <Workflow size={size} />
    case ElementType.BROWSER:
      return <Globe size={size} />
    case ElementType.CACHE:
      return <Zap size={size} />
    case ElementType.CALCULATOR:
      return <CalculatorIcon size={size} />
    case ElementType.CODE:
      return <CodeIcon size={size} />
    case ElementType.CRON_JOB:
      return <Clock size={size} />
    case ElementType.DATA_ANALYSIS:
      return <PieChart size={size} />
    case ElementType.DOWNLOAD:
      return <Download size={size} />
    case ElementType.EMAIL:
      return <Mail size={size} />
    // 工业组件图标
    case ElementType.TRANSFORMER:
      return <Lightbulb size={size} />
    case ElementType.GENERATOR:
      return <Power size={size} />
    case ElementType.SOLAR_PANEL:
      return <Sun size={size} />
    case ElementType.BATTERY:
      return <Battery size={size} />
    case ElementType.POWER_LINE:
      return <Cable size={size} />
    case ElementType.SWITCH:
      return <ToggleLeft size={size} />
    case ElementType.CIRCUIT_BREAKER:
      return <CircuitBoard size={size} />
    case ElementType.SUBSTATION:
      return <Building2 size={size} />
    default:
      return <Cube size={size} />
  }
}
