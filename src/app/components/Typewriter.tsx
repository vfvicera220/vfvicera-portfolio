import React, { useEffect, useState } from 'react';
import Image from "next/image";

import styles from './Typewriter.module.scss';
import handWave from '../assets/memoji/ios_hand_wave.png';


interface TypewriterProps {
    text: string;
    speed: number;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, speed }) => {
    const [finished, setFinished] = useState<boolean>(false);
    const [displayedText, setDisplayedText] = useState<string>('');

    useEffect(() => {
        let index = 0;
        // store text to prevent second character missing due to how React batches state updates
        let currentText = '';
    
        const interval = setInterval(() => {
            if (index < text.length) {
                currentText += text.charAt(index);
                setDisplayedText(currentText);
                index++;
            } else {
                setFinished(true);
                clearInterval(interval);
            }
        }, speed);
    
        return () => {
            clearInterval(interval);
        };
    }, [text, speed]);

    return (
      <h1 className={`${styles.typewriter} text-balance text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl`}>
        {displayedText ? displayedText : '...'}
        {finished && <Image className="inline align-center ml-3 mb-2 h-9 w-auto" src={handWave} alt={""}/>}
      </h1>
    );
};

export default Typewriter;
