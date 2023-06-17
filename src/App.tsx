import {ThemeProvider} from './ThemeProvider'
import {Book} from './Book'
import {useEffect, useState} from "react";
import {unset} from "lodash";
import Boundary, {PYWEBVIEWREADY} from "./lib/boundary";
import {LoadingOverlay} from "@mantine/core";


declare global {
    interface window {
        pywebview: any;
    }

}

export default function App() {
    const [isReady, setIsReady] = useState(false);

    const doReady = () => {
        setIsReady(true);
        window.removeEventListener(PYWEBVIEWREADY, doReady);
    }

    useEffect(() => {
        //@ts-ignore Fuck the hell off with this window not defined shit
        if (window.pywebview !== undefined && window.pywebview.api !== undefined) {
            setIsReady(true);
        } else {
            window.addEventListener(PYWEBVIEWREADY, doReady);
        }
    });

    if(isReady === false){
        return (
            <LoadingOverlay visible={true}/>
        )
    }

    return (
        <ThemeProvider>
            <Book/>
        </ThemeProvider>
    )
}
