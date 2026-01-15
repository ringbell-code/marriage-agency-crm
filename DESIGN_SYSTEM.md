# デザインシステム

## 🎨 カラーパレット

### プライマリカラー
- **アクティブ状態**: `bg-blue-600` `text-white`
- **ホバー**: `bg-gray-100`
- **ボーダー（通常）**: `border-gray-200` または `border-gray-300`
- **ボーダー（強調）**: `border-gray-600`

### テキストカラー
- **見出し（大）**: `text-gray-800` + `font-bold`
- **見出し（小）**: `text-gray-700` + `font-semibold`
- **本文**: `text-gray-700` + `font-medium`
- **補助**: `text-gray-600`

### 背景カラー
- **メイン**: `bg-white`
- **サブ**: `bg-gray-50`
- **カード**: `bg-white` + `border-2 border-gray-200`

### アクセントカラー
- **成功**: `bg-emerald-50` `text-emerald-700` `border-emerald-200`
- **警告**: `bg-amber-50` `text-amber-700` `border-amber-200`
- **エラー**: `bg-rose-50` `text-rose-700` `border-rose-200`
- **情報**: `bg-blue-50` `text-blue-700` `border-blue-200`

## 🚫 使用禁止
- ❌ `gray-900`（黒に近すぎる）
- ❌ `text-black`
- ❌ グラデーション（一部例外を除く）

## ✅ 推奨パターン

### ボタン
```tsx
// プライマリ
<Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">

// セカンダリ
<Button className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold">
```

### カード
```tsx
<Card className="border-2 border-gray-200 bg-white">
  <CardHeader className="bg-gray-50 border-b-2 border-gray-200">
    <CardTitle className="text-gray-800 font-bold">
  </CardHeader>
</Card>
```

### テーブル
```tsx
<TableHead className="text-gray-800 font-bold">
<TableCell className="text-gray-700 font-medium">
```

### フォーム
```tsx
<Input className="border-2 border-gray-300 text-gray-800 font-medium focus:border-blue-600">
<Select className="border-2 border-gray-300 text-gray-800 font-semibold">
```
