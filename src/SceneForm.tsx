import {Anchor, Textarea, TextInput} from '@mantine/core'
import {useForm, zodResolver} from '@mantine/form'
import {type FC} from 'react'
import z from 'zod'

import {useBookContext} from './Book.context'
import {type Scene} from './types'
import {useDebouncedEffect} from './useDebouncedEffect'

const formSchema = z.object({
    summary: z.string().trim().nonempty('Cannot be empty'),
    title: z.string().trim().nonempty('Cannot be empty').min(10, 'Must be at least 10 characters')
})

export interface SceneFormProps {
    scene: Scene
}

export const SceneForm: FC<SceneFormProps> = ({scene}) => {
    const {updateScene} = useBookContext()
    const form = useForm({
        initialValues: {
            summary: scene.summary,
            title: scene.title
        },
        validate: zodResolver(formSchema),
        validateInputOnChange: true
    })

    useDebouncedEffect(
        () => {
            if (form.isDirty() && form.isValid()) {
                updateScene({
                    ...scene,
                    ...form.values
                })
            }
        },
        [form.values],
        {
            delay: 300
        }
    )

    return (
        <>

            <TextInput
                autoCapitalize='words'
                label='Title'
                required
                spellCheck
                {...form.getInputProps('title')}
            />
            <Textarea
                autoCapitalize='sentences'
                autosize
                label='Summary'
                minRows={4}
                required
                spellCheck
                {...form.getInputProps('summary')}
            />
            <a id={`scrollTo-${scene.id}`} />
        </>
    )
}
