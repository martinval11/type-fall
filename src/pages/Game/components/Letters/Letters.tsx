import { useState, useEffect } from 'preact/hooks';

import { initialLetters } from '../../data/initialLetters';

import { LetterBlock } from '../LetterBlock/LetterBlock';
import { Paused } from '../Paused/Paused';
import { shuffleArray } from '../../lib/shuffleArray';
import { playSoundEffect } from '../../lib/playSoundEffect';

import {
  scoreCSS,
  letterBoxContainerCSS,
  dataActionsCSS,
  containerCSS,
} from '../Letters/styles';
import { getRandomDownTimes } from '../../lib/randomDownTimes';
import { Letter } from './types';

export const Letters = ({
  health,
  setHealthAmount,
  attempts,
}: {
  health: number;
  setHealthAmount: (health: number) => void;
  attempts: number;
}) => {
  const [timesDown, setTimesDown] = useState(0);

  const [lettersList, setLettersList]: [Letter[], any] = useState(
    shuffleArray(initialLetters.slice(0, 5))
  );
  const [downTimes, setDownTimes] = useState(getRandomDownTimes(15, 35, initialLetters));
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);

  const [firstTime, setFirstTime] = useState(20);
  const [secondTime, setSecondTime] = useState(35);

  const [indexStart, setIndexStart] = useState(0);
  const [indexEnd, setIndexEnd] = useState(5);

  const hitLetter = (hitLetter: string) => {
    setLettersList((prevLettersList: Letter[]) => {
      const updatedLetters = prevLettersList.map((letter: Letter) => {
        if (letter.letter !== hitLetter || letter.hit) {
          return letter;
        }

        setScore((prevScore: number) => prevScore + 1);

        return { ...letter, hit: true };
      });

      if (updatedLetters.every((letter: Letter) => letter.hit)) {
        setFirstTime((prevTime) => (prevTime <= 0 ? 3 : prevTime - 1));
        setSecondTime((prevTime) => (prevTime <= 0 ? 4 : prevTime - 1));

        setIndexEnd((prevIndex) =>
          prevIndex >= 5
            ? prevIndex + 1 + Math.floor(Math.random() * 4)
            : prevIndex
        );
        setIndexStart((prevIndex) =>
          prevIndex <= 0 ? 0 : indexEnd - 2 + Math.floor(Math.random() * 4)
        );

        setLettersList([]);
        setTimeout(() => {
          setLettersList(
            shuffleArray(initialLetters.slice(indexStart, indexEnd))
          );
          setDownTimes(getRandomDownTimes(firstTime, secondTime, initialLetters));
        }, 800);
      }

      return updatedLetters;
    });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !paused) {
      setPaused(true);
      return;
    }
    hitLetter(event.key);
    playSoundEffect('hit.mp3', 0.5);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // If user wants to retry, reset the game
  useEffect(() => {
    if (attempts !== 0) {
      setLettersList([]);
      setScore(0);

      setFirstTime(20);
      setSecondTime(35);

      setIndexEnd(5);

      setDownTimes(getRandomDownTimes(15, 35, initialLetters));

      setTimeout(() => {
        setLettersList(shuffleArray(initialLetters.slice(0, 5)));
      }, 200);
    }
  }, [attempts]);

  useEffect(() => {
    if (timesDown) {
      setHealthAmount(health - 10);
      playSoundEffect('lost-of-life.mp3', 0.5);
    }
  }, [timesDown])

  return (
    <section className={containerCSS}>
      <header className={dataActionsCSS}>
        <span className={scoreCSS}>Score: {score}</span>

        <Paused paused={paused} setPaused={setPaused} />
      </header>

      <div
        className={letterBoxContainerCSS}
        tabIndex={0}
        onKeyDown={(event) => event.preventDefault()}
      >
        {!paused && lettersList.map((letter: Letter, index: number) => (
          <LetterBlock
            health={health}
            onClick={(event: MouseEvent) => {
              const element = event.target as HTMLDivElement;
              playSoundEffect('hit.mp3', 0.5);
              hitLetter(element.id);
            }}
            letter={letter.letter}
            duration={downTimes[index]}
            key={letter.letter}
            hit={letter.hit}
            isDown={setTimesDown}
            frozen={paused}
          />
        ))}
      </div>
    </section>
  );
};
