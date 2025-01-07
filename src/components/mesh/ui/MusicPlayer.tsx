import { useState } from 'react';
import AudioPlayer from 'react-h5-audio-player'
import 'react-h5-audio-player/lib/styles.css'

const SONGS = {
    "comet": "/audio/comet",
}

export default function MusicPlayer() {
    const [audioPath, setAudioPath] = useState("/audio/comet");

    return (
        <>
            <AudioPlayer src={audioPath}/>
        </>
    )
}