import {Accordion, ActionIcon, Center, createStyles, Group, Stack, Text, Title} from '@mantine/core'
import {IconGripVertical, IconPlus} from '@tabler/icons-react'
import {find, map} from 'lodash'
import {type FC, useCallback} from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'

import {useBookContext} from './Book.context'
import {ChapterForm} from './ChapterForm'
import {ScenePanel} from './ScenePanel'

const useStyles = createStyles((theme) => ({
    accordionContent: {
        padding: theme.spacing.xs,
        paddingTop: 0
    }
}))

export interface RightPanelProps {
}

export const RightPanel: FC<RightPanelProps> = () => {
    const {activeChapter, activeScene, addScene, reorderScene, setActiveScene} = useBookContext()
    const {classes} = useStyles()

    return (
        <Stack spacing='xs'>
            <Title order={4}>Chapter {activeChapter.sequence}</Title>
            <ChapterForm chapter={activeChapter}/>
            <Group
                position='apart'
                spacing='xs'
                p='xs'
                pr='lg'
            >
                <Title order={4}>Scenes</Title>
                <ActionIcon
                    color='blue'
                    onClick={useCallback(() => addScene(activeChapter.id), [activeChapter, addScene])}
                    size='xs'
                    title='Add Section'
                    variant='subtle'
                >
                    <IconPlus/>
                </ActionIcon>
            </Group>
            <Accordion
                variant="contained"
                radius="md"
                value={activeScene.id}

                classNames={{
                    content: classes.accordionContent
                }}
                onChange={useCallback(
                    (sceneId: string) => {
                        const scene = find(activeChapter.scenes, ['id', sceneId])

                        if (scene) {
                            setActiveScene(activeChapter, scene)
                        }
                    },
                    [activeChapter, setActiveScene]
                )}


            >
                <DragDropContext
                    onDragEnd={useCallback(
                        ({destination, source}) => {
                            if (destination && destination.index !== source.index) {
                                reorderScene(activeChapter.id, source.index, destination.index)
                            }
                        },
                        [activeChapter.id, reorderScene]
                    )}
                >
                    <Droppable droppableId='scene-list'>
                        {(droppable) => (
                            <div
                                {...droppable.droppableProps}
                                ref={droppable.innerRef}
                            >
                                {map(activeChapter.scenes, (scene, sceneIdx) => (
                                    <Draggable
                                        draggableId={scene.id}
                                        index={sceneIdx}
                                        key={scene.id}
                                    >
                                        {(draggable) => (
                                            <Accordion.Item
                                                ref={draggable.innerRef}
                                                value={scene.id}
                                                {...draggable.draggableProps}
                                            >
                                                <Accordion.Control
                                                    icon={
                                                        <Center {...draggable.dragHandleProps}>
                                                            <IconGripVertical size='0.75rem'/>
                                                        </Center>
                                                    }
                                                >
                                                    <Text weight='bold'>Scene {scene.sequence}</Text>
                                                </Accordion.Control>
                                                <Accordion.Panel>
                                                    <ScenePanel scene={scene}/>
                                                </Accordion.Panel>
                                            </Accordion.Item>
                                        )}
                                    </Draggable>
                                ))}
                                {droppable.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </Accordion>
        </Stack>
    )
}
