import {
  Home, Activity, Wallet, User, Plus, ArrowLeft, Search,
  Eye, EyeOff, Check, Settings, Bell, Grid3X3, Calendar,
  Camera, Receipt, BarChart3, TrendingUp, DollarSign, Target,
  PiggyBank, CreditCard, Globe, Shield, FileText, HelpCircle,
  Users, MessageCircle, Sparkles, Download, ChevronRight, Trash2,
  Edit3, MoreHorizontal, ArrowUp, ArrowDown, RefreshCw, LogOut,
  Lock, X, Upload, Flag, CircleArrowDown, Landmark, Link,
  Sun, Moon, Monitor, ListFilter, type LucideIcon,
} from 'lucide-react';
import { useTheme } from '@/shared/theme';
import type { ThemeIconSizes } from '@/shared/theme';

export type AppIconName =
  | 'home' | 'activity' | 'budgets' | 'profile' | 'add'
  | 'arrowLeft' | 'search' | 'eye' | 'eyeSlash' | 'checkmark'
  | 'settings' | 'notification' | 'category' | 'filter' | 'calendar'
  | 'camera' | 'receipt' | 'chart' | 'trendingUp' | 'dollar'
  | 'target' | 'piggyBank' | 'creditCard' | 'globe' | 'shield'
  | 'fileText' | 'helpCircle' | 'users' | 'chat' | 'sparkles'
  | 'download' | 'chevronRight' | 'trash' | 'edit' | 'more'
  | 'arrowUp' | 'arrowDown' | 'refresh' | 'logout' | 'lock'
  | 'close' | 'upload'
  | 'goals' | 'income' | 'ai' | 'netWorth' | 'wallet' | 'family'
  | 'link' | 'bell' | 'support' | 'document' | 'sun' | 'moon'
  | 'auto' | 'personFill';

const ICON_MAP: Record<AppIconName, LucideIcon> = {
  home: Home,
  activity: Activity,
  budgets: Wallet,
  profile: User,
  add: Plus,
  arrowLeft: ArrowLeft,
  search: Search,
  eye: Eye,
  eyeSlash: EyeOff,
  checkmark: Check,
  settings: Settings,
  notification: Bell,
  category: Grid3X3,
  filter: ListFilter,
  calendar: Calendar,
  camera: Camera,
  receipt: Receipt,
  chart: BarChart3,
  trendingUp: TrendingUp,
  dollar: DollarSign,
  target: Target,
  piggyBank: PiggyBank,
  creditCard: CreditCard,
  globe: Globe,
  shield: Shield,
  fileText: FileText,
  helpCircle: HelpCircle,
  users: Users,
  chat: MessageCircle,
  sparkles: Sparkles,
  download: Download,
  chevronRight: ChevronRight,
  trash: Trash2,
  edit: Edit3,
  more: MoreHorizontal,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  refresh: RefreshCw,
  logout: LogOut,
  lock: Lock,
  close: X,
  upload: Upload,
  goals: Flag,
  income: CircleArrowDown,
  ai: Sparkles,
  netWorth: Landmark,
  wallet: Wallet,
  family: Users,
  link: Link,
  bell: Bell,
  support: HelpCircle,
  document: FileText,
  sun: Sun,
  moon: Moon,
  auto: Monitor,
  personFill: User,
};

type IconSizeName = keyof ThemeIconSizes;

interface AppIconProps {
  name: AppIconName;
  /** A raw pixel size, or a named token from the icon size scale (defaults to `md` = 20px). */
  size?: number | IconSizeName;
  color?: string;
}

export function AppIcon({ name, size = 'md', color = 'currentColor' }: AppIconProps) {
  const theme = useTheme();
  const Icon = ICON_MAP[name] ?? HelpCircle;
  const resolvedSize = typeof size === 'number' ? size : theme.iconSizes[size];
  return <Icon size={resolvedSize} color={color} strokeWidth={2} />;
}
