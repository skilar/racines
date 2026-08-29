import { defineAction } from 'astro:actions'
import { z } from 'astro/zod'

export const server = {
    newsletter: defineAction({
        accept: 'form',
        input: z.object({
            email_address: z.email(),
            first_name: z.string().optional(),
            last_name: z.string().optional(),
        }),
        handler: async ({ email_address, first_name, last_name }) => {
            console.log('email', email_address, first_name, last_name)
        },
    }),
}
