import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export interface ClaudeOptions {
  maxTokens?: number
  temperature?: number
}

export async function generateWithClaude(
  prompt: string,
  options: ClaudeOptions = {}
): Promise<string> {
  const { maxTokens = 2000, temperature = 0.3 } = options

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    temperature,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  const textBlock = response.content.find(block => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  return textBlock.text
}
