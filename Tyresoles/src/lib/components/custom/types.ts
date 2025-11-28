import type { Snippet } from "svelte";
import type { ButtonProps as PrimitiveButtonProps } from "$lib/components/ui/button";
import type { HTMLInputAttributes } from "svelte/elements";
import type { WithElementRef } from "bits-ui";
import type { DateValue } from "@internationalized/date";
import type { Rule } from "$lib/managers/services/validation";
import type { FetchParams } from "$lib/business/models";
import type { event } from "@tauri-apps/api";

export type InputType =
  | "text"
  | "password"
  | "number"
  | "date"
  | "date-range"
  | "list"
  | "boolean";

export interface ButtonProps extends PrimitiveButtonProps {
  icon?: string;
  iconClass?: string;
  loading?: boolean | undefined;
  label?: string;
  menuItems?: Array<MenuItem>;
}
export interface InputProps extends WithElementRef<HTMLInputAttributes> {
  type?: InputType;
  icon?: string;
  min?: number | string;
  max?: number | string;
  step?: number;
  onInput?: (value: unknown, extra?: unknown) => void;
  data?: Array<object>;
  dataKey?: string;
  valueKey?: string;
  labelKey?: string;
  selectionType?: "single" | "multiple";
  enableSelection?: boolean;
  enableSearch?: boolean;
  hideHeader?: boolean;
  columns?: Array<TableColumn>;
  format?: string;
  output?: "string" | "object" | "number" | "date" | "array";
  yearsOnCalendar?: number;
  yearsOnCalendarFuture?: number;
  preset?: string;
  fromDate?: Date | string | undefined;
  toDate?: Date | string | undefined;
  hidden?: boolean;
  label?: string;
  description?: string;
  errors?: Array<string>;
  rules?: Array<Rule<unknown>>;
  popoverAnchorClass?: string;
  indirect?: boolean; //to hide from focus manager, for search input on list.
}

export interface FormProps {
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
  class?: string;
  layoutClass?: string;
  loading?: boolean;
  autofocus?: boolean;
  fields: Array<InputProps>;
  actions?: Array<ButtonProps>;
  data?: Record<string, unknown>;
  onSubmit?: (data: Record<string, unknown>) => void;
}

export type CalendarValue = DateValue | DateValue[] | undefined;

export interface DialogProps {
  open?: boolean;
  title?: string;
  icon?: string;
  description?: string;
  cancelLabel?: string;
  actionLabel?: string;
  onCancel?: () => void;
  onAction?: () => void;
}

export interface DialogPageProps {
  open?: boolean;
  title?: string;
  icon?: string;
  description?: string;
  actionLabel?: string;
  loading?: boolean;
  footer?: boolean;
  overlay?: boolean;
  autoFocus?: boolean;
  actions?: Array<ButtonProps>;
  class?: string;
  children?: Snippet;
  onOpenChange?: (open: boolean) => void;
  onAction?: () => void;
  onClose?: () => void;
  onEscapeKeydown?: (event: KeyboardEvent) => void;
  onInteractOutside?: (event: PointerEvent) => void;
  onFocusOutside?: (event: FocusEvent) => void;
  interactOutsideBehavior?:
    | "close"
    | "ignore"
    | "defer-otherwise-close"
    | "defer-otherwise-ignore";
  escapeKeydownBehavior?:
    | "close"
    | "ignore"
    | "defer-otherwise-close"
    | "defer-otherwise-ignore";
}

export interface AlertProps {
  type?: "default" | "destructive";
  title?: string;
  description?: string;
  icon?: string;
  class?: string;
}

export interface MenuItem {
  label?: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  shortcut?: string;
  items?: Array<MenuItem>;
  seperator?: boolean;
  disabled?: boolean;
  checked?: boolean;
  checkBox?: boolean;
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  radioValue?: string;
  radioOptions?: Array<{ value: string; label: string }>;
}

export interface Menu {
  label?: string;
  items?: Array<MenuItem>;
}
export interface DropdownMenuProps {
  menu?: Menu;
  buttonSize?: "default" | "icon" | "lg" | "sm";
  buttonVariant?:
    | "ghost"
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary";
  disabled?: boolean;
  class?: string;
  triggerClass?: string;
  children?: Snippet;
}

export interface TableColumn {
  name?: string;
  label?: string;
  textAlign?: "left" | "center" | "right";
  aggregation?: undefined | "sum" | "avg" | "count";
  width?: number;
  formatter?: (value: unknown) => string;
}

export interface TableProps {
  id?: string;
  type?: "dropdown" | "table";
  value?: string;
  data: Array<object>;
  dataKey?: string;
  valueKey?: string;
  labelKey?: string;
  searchTerm?: string;
  columns?: Array<TableColumn>;
  selectionType?: "single" | "multiple";
  enableSelection?: boolean;
  enableSearch?: boolean;
  enableFilter?: boolean;
  filterFields?: Array<InputProps>;
  filterData?: object;
  selectedValues?: Set<string>;
  hideHeader?: boolean;
  class?: string;
  onRowClick?: (row: object) => void;
  onSelectionChange?: (selection: Map<string, object>) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  footer?: boolean;
  actions?: Array<ButtonProps>;
  loading?: boolean;
  inLineActions?: DropdownMenuProps;
  bottomMargin?: number;
}

export interface TableHeaderProps {
  type?: "dropdown" | "table";
  column?: TableColumn;
  data?: Array<object>;
  filters?: Array<{ column: string; value: string }>;
  handleSort?: (column: string, direction: "asc" | "desc") => void;
  width?: number;
  onResize?: (event: MouseEvent | TouchEvent, index: number) => void;
  index?: number;
  sortOrder?: "desc" | "asc" | undefined;
}

export interface LocationSwitcherProps {
  company?: string;
  location?: string;
  locations?: Array<{ code: string; label: string; logo: string }>;
}

export interface NavUserProps {
  name?: string;
  title?: string;
  avatar?: string;
  menus?: Array<MenuItem>;
}

export interface NavItemProps {
  title: string;
  url: string;
  icon: string;
  isActive?: boolean;
  items?: Array<NavItemProps>;
}

export interface SidebarProps {
  locationSwitcher?: LocationSwitcherProps;
  userNav?: Array<NavUserProps>;
  mainNav?: Array<{ label?: string; items: Array<NavItemProps> }>;
}

export interface TileProps {
  icon?: string;
  label?: string;
  value?: number;
  description?: string;
  onClick?: () => void;
  indicator?: "default" | "positive" | "negative" | "neutral";
}

export interface TilesBoardProps {
  loading?: boolean;
  onRefresh?: () => void;
  onTileClick?: (label: string) => void;
  tiles?: Array<TileProps>;
}

export interface BannerProps {
  type: "default" | "destructive";
  title?: string;
  description?: string;
  icon?: string;
  class?: string;
  buttons?: Array<ButtonProps>;
}

export interface RibbonTab {
  id: string;
  label: string;
  groups: RibbonGroup[];
}

export interface RibbonGroup {
  id: string;
  label?: string;
  controls: RibbonControl[];
}

export interface RibbonControl {
  id: string;
  type: "button" | "dropdown" | "toggle" | "separator" | "input";
  label?: string;
  icon?: string;
  options?: { label: string; value: string }[];
  value?: string;
  // Add other properties (onClick handlers, etc.)
}
