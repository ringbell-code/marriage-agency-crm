/**
 * デザイントークン - プロジェクト全体で使用する色とスタイルの定義
 * 
 * 使用方法:
 * import { colors, badges } from '@/lib/design-tokens'
 * 
 * <div className={colors.card.background}>
 *   <h1 className={colors.text.primary}>Title</h1>
 * </div>
 */

// ============================================
// カラーパレット（基本色）
// ============================================
export const palette = {
  // グレースケール
  white: '#FFFFFF',
  gray50: 'rgb(249 250 251)',   // bg-gray-50
  gray100: 'rgb(243 244 246)',  // bg-gray-100
  gray200: 'rgb(229 231 235)',  // bg-gray-200
  gray300: 'rgb(209 213 219)',  // bg-gray-300
  gray600: 'rgb(75 85 99)',     // text-gray-600
  gray700: 'rgb(55 65 81)',     // text-gray-700
  gray800: 'rgb(31 41 55)',     // text-gray-800
  
  // アクセントカラー
  blue600: 'rgb(37 99 235)',    // bg-blue-600
  blue700: 'rgb(29 78 216)',    // hover:bg-blue-700
  
  // ステータスカラー
  violet100: 'rgb(237 233 254)', // bg-violet-100
  violet600: 'rgb(124 58 237)',  // text-violet-600
  
  amber50: 'rgb(255 251 235)',   // bg-amber-50
  amber100: 'rgb(254 243 199)',  // bg-amber-100
  amber200: 'rgb(253 230 138)',  // border-amber-200
  amber400: 'rgb(251 191 36)',   // border-amber-400
  amber600: 'rgb(217 119 6)',    // text-amber-600
  amber700: 'rgb(180 83 9)',     // text-amber-700
  amber800: 'rgb(146 64 14)',    // text-amber-800
  
  rose50: 'rgb(255 241 242)',    // bg-rose-50
  rose100: 'rgb(255 228 230)',   // bg-rose-100
  rose200: 'rgb(254 205 211)',   // border-rose-200
  rose600: 'rgb(225 29 72)',     // text-rose-600
  rose700: 'rgb(190 18 60)',     // text-rose-700
  rose800: 'rgb(159 18 57)',     // text-rose-800
  
  emerald600: 'rgb(5 150 105)',  // text-emerald-600
  emerald700: 'rgb(4 120 87)',   // text-emerald-700
}

// ============================================
// テキストカラー
// ============================================
export const colors = {
  text: {
    primary: 'text-gray-800',        // メインテキスト（黒に近い）
    secondary: 'text-gray-700',      // サブテキスト
    tertiary: 'text-gray-600',       // 補助テキスト
    muted: 'text-gray-500',          // 薄いテキスト
  },
  
  // 背景色
  background: {
    page: 'bg-gray-50',              // ページ全体の背景
    card: 'bg-white',                // カード背景（白）
    cardHeader: 'bg-white',          // カードヘッダー（白）
    hover: 'hover:bg-gray-50',       // ホバー時
  },
  
  // ボーダー
  border: {
    default: 'border-gray-200',      // 通常のボーダー
    strong: 'border-gray-300',       // 強調ボーダー
    input: 'border-gray-300',        // 入力欄
    hover: 'hover:border-gray-400',  // ホバー時
  },
  
  // ボタン
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
  },
  
  // カード
  card: {
    default: 'bg-white border-2 border-gray-200',
    hover: 'hover:border-gray-300',
  },
}

// ============================================
// アラート・ステータスカラー
// ============================================
export const alertColors = {
  // 警告（面談未設定など）
  warning: {
    background: 'bg-white',           // 白背景
    border: 'border-amber-200',       // アンバーのボーダー
    text: 'text-amber-800',           // 濃いアンバーのテキスト
    icon: 'text-amber-600',
    cardHeader: 'bg-white border-b-2 border-amber-200',
  },
  
  // 緊急（30日以上連絡なしなど）
  urgent: {
    background: 'bg-white',           // 白背景
    border: 'border-rose-200',        // ローズのボーダー
    text: 'text-rose-800',            // 濃いローズのテキスト
    icon: 'text-rose-600',
    cardHeader: 'bg-white border-b-2 border-rose-200',
  },
  
  // 情報
  info: {
    background: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-800',
    icon: 'text-gray-600',
    cardHeader: 'bg-white border-b-2 border-gray-200',
  },
}

// ============================================
// ステータスバッジカラー
// ============================================
export const badgeColors = {
  '公開前': 'bg-white border-2 border-gray-300 text-gray-800',
  'お見合い': 'bg-white border-2 border-blue-300 text-blue-800',
  '仮交際': 'bg-white border-2 border-violet-300 text-violet-800',
  '真剣交際': 'bg-white border-2 border-rose-300 text-rose-800',
  '成婚退会': 'bg-white border-2 border-emerald-300 text-emerald-800',
  '休会': 'bg-white border-2 border-amber-300 text-amber-800',
  '退会': 'bg-white border-2 border-gray-300 text-gray-600',
}

// ============================================
// KPIカード用カラー（シンプルなアイコンカラーのみ使用）
// ============================================
export const kpiCardColors = {
  total: {
    background: 'bg-white',
    border: 'border-gray-200',
    iconBg: 'bg-gray-100',
    icon: 'text-gray-600',
    text: 'text-gray-800',
    label: 'text-gray-600',
  },
  active: {
    background: 'bg-white',
    border: 'border-gray-200',
    iconBg: 'bg-blue-50',
    icon: 'text-blue-600',
    text: 'text-gray-800',
    label: 'text-gray-600',
  },
  successful: {
    background: 'bg-white',
    border: 'border-gray-200',
    iconBg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    text: 'text-gray-800',
    label: 'text-gray-600',
  },
  meetings: {
    background: 'bg-white',
    border: 'border-gray-200',
    iconBg: 'bg-violet-50',
    icon: 'text-violet-600',
    text: 'text-gray-800',
    label: 'text-gray-600',
  },
}

// ============================================
// ヘルパー関数
// ============================================

/**
 * KPIカードの完全なクラス名を取得
 */
export function getKpiCardClasses(type: keyof typeof kpiCardColors) {
  const c = kpiCardColors[type]
  return {
    card: `${c.background} border-2 ${c.border}`,
    iconContainer: `h-12 w-12 rounded-xl ${c.iconBg} flex items-center justify-center`,
    icon: c.icon,
    value: `text-3xl font-bold ${c.text}`,
    label: `text-sm ${c.label}`,
  }
}

/**
 * アラートカードの完全なクラス名を取得
 */
export function getAlertCardClasses(type: keyof typeof alertColors) {
  const c = alertColors[type]
  return {
    card: `${c.background} border-2 ${c.border}`,
    header: c.cardHeader,
    title: `text-lg font-bold ${c.text}`,
    description: `text-sm font-medium ${c.text}`,
    icon: c.icon,
    itemBorder: `border-2 ${c.border}`,
  }
}

/**
 * ステータスバッジのクラス名を取得
 */
export function getBadgeClasses(status: string): string {
  return badgeColors[status as keyof typeof badgeColors] || badgeColors['公開前']
}
