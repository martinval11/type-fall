import { useState, useEffect } from 'preact/hooks';

import { initialLetters } from '../../data/initialLetters';

import { LetterBlock } from '../LetterBlock/LetterBlock';
import { Paused } from '../Paused/Paused';
import { shuffleArray } from '../../lib/shuffleArray';
import { playSoundEffect } from '../../lib/playSoundEffect';

import { scoreCSS, letterBoxContainerCSS } from '../Letters/styles';
import { Letter } from './types';

const getRandomDownTimes = (min: number, max: number): number[] => {
  return initialLetters.map(() =>
    Math.round(Math.random() * (max - min) + min)
  );
};

const randomInitialLetters = shuffleArray(initialLetters);

export const Letters = ({
  setHealthAmount,
}: {
  setHealthAmount: (health: number) => void;
}) => {
  const [lettersList, setLettersList]: [Letter[], any] = useState(
    randomInitialLetters.slice(0, 5)
  );
  const [downTimes, setDownTimes] = useState(getRandomDownTimes(15, 35));
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);

  const [firstTime, setFirstTime] = useState(20);
  const [secondTime, setSecondTime] = useState(35);

  const [indexStart] = useState(0);
  const [indexEnd, setIndexEnd] = useState(5);

  const hitLetter = (hitLetter: string) => {
    setLettersList((prevLettersList: Letter[]) => {
      const updatedLetters = prevLettersList.map((letter: Letter) => {
        if (letter.letter === hitLetter) {
          playSoundEffect('hit.mp3', 0.5);

          if (!letter.hit) {
            setScore((prevScore: number) => prevScore + 1);
          }

          return { ...letter, hit: true };
        }
        return letter;
      });

      if (updatedLetters.every((letter: Letter) => letter.hit)) {
        setFirstTime((prevTime) => (prevTime <= 0 ? 3 : prevTime - 1));
        setSecondTime((prevTime) => (prevTime <= 0 ? 4 : prevTime - 1));

        setIndexEnd((prevIndex) =>
          prevIndex >= 5 ? prevIndex + 1 : prevIndex
        );

        setLettersList([]);
        setTimeout(() => {
          setLettersList(randomInitialLetters.slice(indexStart, indexEnd));
          setDownTimes(getRandomDownTimes(firstTime, secondTime));
        }, 200);
      }

      return updatedLetters;
    });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setPaused(true);
      return;
    }

    hitLetter(event.key);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <section>
      <span className={scoreCSS}>Score: {score}</span>
      <div
        className={letterBoxContainerCSS}
        tabIndex={0}
        onKeyDown={(event) => event.preventDefault()}
      >
        {!paused &&
          lettersList.map((letter: Letter, index: number) => (
            <LetterBlock
              onClick={(event: MouseEvent) => {
                const element = event.target as HTMLDivElement;
                hitLetter(element.id);
              }}
              letter={letter.letter}
              duration={downTimes[index]}
              key={letter.letter}
              hit={letter.hit}
              setHealth={setHealthAmount}
              frozen={paused}
            />
          ))}
      </div>

      {paused && <Paused paused={paused} setPaused={setPaused} />}
    </section>
  );
};