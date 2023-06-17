import {AppShell, Box, createStyles, Group, Header, Switch, Title, useMantineColorScheme} from '@mantine/core'
import {IconSun, IconMoonStars} from '@tabler/icons-react'
import {clone, find, map, range} from 'lodash'
import {LoremIpsum} from 'lorem-ipsum'
import {useCallback, useMemo, useState} from 'react'

import {GenerateRandomString} from "./lib/utils";
import InputModal from "./lib/input_modal";

import {BookContext} from './Book.context'
import {LeftPanel} from './LeftPanel'
import {RightPanel} from './RightPanel'
import {type Chapter, type Scene} from './types'

const loremIpsum = new LoremIpsum()
const randomId = () => Math.random().toString(36).slice(2, 11)
const createScene = (chapterId: string, order = 1): Scene => (
    {
        chapterId,
        id: GenerateRandomString(12),
        order,
        summary: loremIpsum.generateSentences(3),
        title: loremIpsum.generateWords(3),
        words: 0
    });

const createChapter = (order = 1): Chapter => {
    const chapterId = randomId()

    return {
        id: chapterId,
        order,
        scenes: [],
        notes: "",
        summary: loremIpsum.generateSentences(3),
        title: loremIpsum.generateWords(3),
        words: 0
    }
}

const data = map<number, Chapter>(range(1, 20), (chapterIdx) => {
    const chapter = createChapter(chapterIdx)

    return {
        ...chapter,
        scenes: map<number, Scene>(range(1, 10), (sceneIdx) => createScene(chapter.id, sceneIdx))
    }
})

const useStyles = createStyles((theme) => ({
    main: {
        backgroundColor: theme.colorScheme === 'light' ? theme.colors.gray[0] : theme.colors.dark[6]
    }
}))

export const Book = () => {
    const {classes, theme} = useStyles()
    const {colorScheme, toggleColorScheme} = useMantineColorScheme()
    const [chapters, _setChapters] = useState<Chapter[]>(data)
    const [activeChapter, _setActiveChapter] = useState(data[0])
    const [activeScene, _setActiveScene] = useState(data[0].scenes[0])

    const addChapter = useCallback(
        () =>
            _setChapters((prevChapters) => {
                const chapter = createChapter(prevChapters.length + 1)
                const scene = createScene(chapter.id)

                chapter.scenes.push(scene)

                _setActiveChapter(chapter)
                _setActiveScene(scene)

                return [...prevChapters, chapter]
            }),
        []
    )

    const addScene = useCallback(
        (chapterId: string) =>
            _setChapters((prevChapters) =>
                map(prevChapters, (chapter) => {
                    if (chapter.id === chapterId) {
                        const scene = createScene(chapter.id, chapter.scenes.length + 1)
                        const updatedChapter: Chapter = {
                            ...chapter,
                            scenes: [...chapter.scenes, scene]
                        }

                        _setActiveChapter(updatedChapter)
                        _setActiveScene(scene)

                        return updatedChapter
                    }

                    return chapter
                })
            ),
        []
    )
    const getChapter = useCallback((chapterId: string) => find(chapters, ['id', chapterId]), [chapters])
    const reorderChapter = useCallback(
        (from: number, to: number) =>
            _setChapters((prevChapters) => {
                // make a clone of the chapters array, so we don't mutate it in place
                const nextChapters = clone(prevChapters)

                // reorder the chapter array
                nextChapters.splice(to, 0, nextChapters.splice(from, 1)[0])

                // iterate over each item and overwrite its new sequence
                return map(nextChapters, (chapter, chapterIdx) => ({
                    ...chapter,
                    sequence: chapterIdx + 1
                }))
            }),
        []
    )
    const reorderScene = useCallback(
        (chapterId: string, from: number, to: number) =>
            _setChapters((prevChapters) =>
                map(prevChapters, (chapter) => {
                    if (chapter.id === chapterId) {
                        // make a clone of the scenes array, so we don't mutate it in place
                        const nextScenes = clone(chapter.scenes)

                        // reorder the scenes array
                        nextScenes.splice(to, 0, nextScenes.splice(from, 1)[0])

                        const nextChapter: Chapter = {
                            ...chapter,
                            // iterate over each item and overwrite its new sequence
                            scenes: map(nextScenes, (scene, sceneIdx) => ({
                                ...scene,
                                sequence: sceneIdx + 1
                            }))
                        }

                        _setActiveChapter(nextChapter)

                        return nextChapter
                    }

                    return chapter
                })
            ),
        []
    )
    const setActiveChapter = useCallback((chapter: Chapter) => {
        _setActiveChapter(chapter)
        _setActiveScene(chapter.scenes[0])
    }, [])
    const setActiveScene = useCallback((chapter: Chapter, scene: Scene) => {
        _setActiveChapter(chapter)
        _setActiveScene(scene)
    }, [])
    const updateChapter = useCallback(
        (chapter: Chapter) =>
            _setChapters((prevChapters) =>
                map(prevChapters, (prevChapter) => (prevChapter.id === chapter.id ? chapter : prevChapter))
            ),
        []
    )
    const updateScene = useCallback(
        (scene: Scene) => {
            const chapter = getChapter(scene.chapterId)

            if (chapter) {
                updateChapter({
                    ...chapter,
                    scenes: map(chapter.scenes, (prevScene) => (prevScene.id === scene.id ? scene : prevScene))
                })
            }
        },
        [getChapter, updateChapter]
    )

    const bookContextValue = useMemo(
        () => ({
            activeChapter,
            activeScene,
            addChapter,
            addScene,
            chapters,
            reorderChapter,
            reorderScene,
            setActiveChapter,
            setActiveScene,
            updateChapter,
            updateScene
        }),
        [
            activeChapter,
            activeScene,
            addChapter,
            addScene,
            chapters,
            reorderChapter,
            reorderScene,
            setActiveChapter,
            setActiveScene,
            updateChapter,
            updateScene
        ]
    )

    return (
        <BookContext.Provider value={bookContextValue}>
            <AppShell
                classNames={{
                    main: classes.main
                }}
                fixed
                navbar={<LeftPanel/>}
                header={
                    <Header height={60}>
                        <Group
                            align='center'
                            position='apart'
                            h={60}
                            px='xs'
                        >
                            <Title order={1}>Book Title</Title>
                            <Switch
                                checked={colorScheme === 'dark'}
                                onChange={useCallback(() => toggleColorScheme(), [toggleColorScheme])}
                                size='lg'
                                onLabel={
                                    <IconMoonStars
                                        color={theme.white}
                                        size='1.25rem'
                                        stroke={1.5}
                                    />
                                }
                                offLabel={
                                    <IconSun
                                        color={theme.colors.gray[6]}
                                        size='1.25rem'
                                        stroke={1.5}
                                    />
                                }
                            />
                        </Group>
                    </Header>
                }
                padding={0}
            >
                <Box
                    px='md'
                    py='sm'
                >
                    <RightPanel key={`${activeChapter.id}-${activeScene.id}`}/>
                </Box>
            </AppShell>
        </BookContext.Provider>
    )
}
