"use server"

import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// AI解析結果のスキーマ
const ActivityAnalysisSchema = z.object({
  summary: z.string().describe("入力テキストの詳細な日本語要約（300〜500文字程度、重要な固有名詞・日付・金額・具体的な内容を含む構造化された要約）"),
  sentiment: z.enum(["positive", "neutral", "negative"]).describe("感情分析結果"),
  suggested_next_action: z.string().describe("次に取るべき具体的なアクション"),
  suggested_next_meeting: z.string().nullable().describe("次回面談日（YYYY-MM-DD形式、なければnull）"),
})

// AI解析結果の型定義
export type ActivityAnalysis = {
  summary: string
  sentiment: "positive" | "neutral" | "negative"
  suggested_next_action: string
  suggested_next_meeting: string | null
}

// AI解析のみ実行（保存しない）
export async function analyzeActivity(
  text: string
): Promise<{ success: boolean; data?: ActivityAnalysis; error?: string }> {
  try {
    let analysis: ActivityAnalysis

    // OpenAI APIキーの確認
    const hasApiKey = !!process.env.OPENAI_API_KEY

    if (hasApiKey) {
      // AI解析を実行
      const result = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: ActivityAnalysisSchema,
        prompt: `
あなたは結婚相談所のプロフェッショナルなカウンセラーアシスタントです。
以下の会員とのやり取り（面談記録、LINE履歴、メモなど）を分析し、**詳細かつ構造化された要約**を作成してください。

【入力テキスト】
${text}

【要約作成の重要な指示】
1. **詳細度**: 300〜500文字程度の十分な情報量
2. **構造化**: 以下の要素を含めてください
   - 会話の概要・背景
   - 現在の交際状況（相手の名前、印象、進捗など）
   - 具体的な課題や懸念事項
   - カウンセラーからの提案・アドバイス
   - 今後の予定や決定事項
3. **固有名詞の保持**: 人名、会社名、サービス名などは正確に記載
4. **数値情報の保持**: 日付、金額、期間、回数などは具体的に記載
5. **重要な発言の引用**: 会員の本音や重要なコメントがあれば含める
6. **読みやすさ**: 適切に改行し、段落分けしてください

【悪い例】
「会員のれんさんは、現在進行中の交際相手との関係が良好であり、次回のデートでより深い話をすることを希望しています。」

【良い例】
「平川さん（れん）は現在、安田さんと交際中で、これまでの交際の中で最も印象が良い相手だと感じている。二人は共にアニメや漫画が好きという共通の趣味があり、会話も非常にスムーズ。LINEでの頻繁なやり取りはないものの、デート日程の調整は迅速で、ストレスは感じていない。

次回のデートは日曜日に予定されており、今回からより深い価値観の話をしていく予定。安田さん側も深い会話を希望しており、真剣交際への進展を見据えた段階に入っている。カウンセラーからは、価値観の擦り合わせにゲーム形式のアプリ（15問の質問形式）を使うことを提案された。

お見合いについては、現在は一時的に控えているが、カウンセラーからは比較検討のため、もう少し交際人数を増やすことを推奨された。ただし、真剣交際に進む際は、お見合いのキャンセル料（1件1万円）や仮交際の違約金（2万円）が発生する可能性があることを確認。

次回面談は2月4日（水）20:00に設定。1〜3月の間にパートナーを見つけることを目標としている。」

【出力形式】
- sentiment: 会員の全体的な気持ちや状況を positive/neutral/negative で判定
- suggested_next_action: 最も優先度の高い、具体的で実行可能なアクション（「〜について話し合う」「〜を確認する」など）
- suggested_next_meeting: テキスト中に明確な日付があれば YYYY-MM-DD 形式で抽出（曖昧な表現の場合はnull）
`,
      })

      analysis = result.object
    } else {
      // ダミーデータ（開発用）
      console.warn("⚠️ OPENAI_API_KEY が設定されていません。ダミーデータを使用します。")
      analysis = {
        summary: "（AI解析）" + text.substring(0, 50) + "...",
        sentiment: "neutral" as const,
        suggested_next_action: "次回面談で詳細を確認する",
        suggested_next_meeting: null,
      }
    }

    return { success: true, data: analysis }
  } catch (error) {
    console.error("AI解析エラー:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "不明なエラーが発生しました" 
    }
  }
}

// 解析結果を保存（ユーザーがAcceptした後）
export async function saveActivityLog(
  memberId: string,
  text: string,
  type: string,
  analysis: ActivityAnalysis,
  updateMemberFields: boolean = true
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. activity_logsにログを保存
    const { data: logData, error: logError } = await supabase
      .from("activity_logs")
      .insert({
        member_id: memberId,
        type,
        content: text,
        summary: analysis.summary,
        sentiment: analysis.sentiment,
      })
      .select()
      .single()

    if (logError) {
      console.error("ログ保存エラー:", logError)
      return { success: false, error: logError.message }
    }

    // 2. membersテーブルを更新（ユーザーが希望した場合のみ）
    if (updateMemberFields) {
      const updateData: any = {
        next_action: analysis.suggested_next_action,
        last_meeting_date: new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString(),
      }

      // 次回面談日が指定されている場合のみ更新
      if (analysis.suggested_next_meeting) {
        updateData.next_meeting_date = analysis.suggested_next_meeting
        updateData.next_meeting_status = 'scheduled'
      } else {
        updateData.next_meeting_date = null
        updateData.next_meeting_status = 'unset'
      }

      const { error: updateError } = await supabase
        .from("members")
        .update(updateData)
        .eq("id", memberId)

      if (updateError) {
        console.error("会員情報更新エラー:", updateError)
        return { success: false, error: updateError.message }
      }
    }

    // ページを再検証
    revalidatePath(`/members/${memberId}`)
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("保存エラー:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "不明なエラーが発生しました" 
    }
  }
}
