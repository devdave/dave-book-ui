import {Accordion, ActionIcon, Center, createStyles, Group, Text, Title} from "@mantine/core";
import {useCallback} from "react";
import {IconGripVertical, IconPlus} from "@tabler/icons-react";
import {find, map} from "lodash";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {ScenePanel} from "./ScenePanel";
import {useBookContext} from "./Book.context";

const useStyles = createStyles((theme) => ({
    accordionContent: {
        padding: theme.spacing.xs,
        paddingTop: 0
    }
}))

const SceneList = () => {

    const {activeChapter, activeScene, addScene, reorderScene, setActiveScene} = useBookContext()
    const {classes} = useStyles();



    if (activeChapter === null) {
        return (
            <Group position="center">
                <h2>Create a new Chapter</h2>
            </Group>
        )
    }

    if (activeScene === undefined || activeChapter?.scenes?.length <= 0) {
        return (
            <Group position="center">
                <h2>Create a new scene</h2>
            </Group>
        )
    }

    console.log("Rendering scene list", activeChapter?.scenes);

    return (

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
                                                <Text weight='bold'>Scene {scene.order}</Text>
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
    );
};


export default SceneList;