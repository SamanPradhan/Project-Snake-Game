import { useRef, useEffect, useState } from "react";
import './App.css';

const CircleRadius = 20;
const GameSpeed = 200;
const SegmentSize = 15;
const MaxAttempts = 100;

const App = () => {
  const canvasRef = useRef(null);

  const [snake, setSnake] = useState([{ x: 0, y: 0 }]);
  const [direction, setDirection] = useState({ x: 1, y: 0 });

  const [food, setFood] = useState({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);



  useEffect(() => {

    const handleKeyDown = (e) => {

      if (e.key === "ArrowUp") {
        setDirection({ x: 0, y: -1 });
      } else if (e.key === "ArrowDown") {
        setDirection({ x: 0, y: 1 });
      } else if (e.key === "ArrowLeft") {
        setDirection({ x: -1, y: 0 });
      } else if (e.key === "ArrowRight") {
        setDirection({ x: 1, y: 0 });
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  

  const isInCircle = (x, y) => {
    return x * x + y * y <= CircleRadius * CircleRadius;
  };

  const getRandomFoodPosition = () => {
    let x, y;
    let attempts = 0;
    do {
      x = Math.floor(Math.random() * (2 * CircleRadius + 1)) - CircleRadius;
      y = Math.floor(Math.random() * (2 * CircleRadius + 1)) - CircleRadius;
      attempts++;
    } while (!isInCircle(x, y) || snake.some(segment => segment.x === x && segment.y === y) && attempts < MaxAttempts);
    return { x, y };
  };

  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    context.beginPath();
    context.arc(CircleRadius * SegmentSize, CircleRadius * SegmentSize, CircleRadius * SegmentSize, 0, 2 * Math.PI);
    context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
    context.stroke();

    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--snake-color');
    snake.forEach((segment) => {
      context.beginPath();
      context.arc(
        (segment.x + CircleRadius) * SegmentSize,
        (segment.y + CircleRadius) * SegmentSize,
        SegmentSize / 2,
        0,
        2 * Math.PI
      );
      context.fill();
    });

    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--food-color');
    context.beginPath();
    context.arc(
      (food.x + CircleRadius) * SegmentSize,
      (food.y + CircleRadius) * SegmentSize,
      SegmentSize / 1.5,
      0,
      2 * Math.PI
    );

    context.fill();
  }, [snake, food]);

  useEffect(() => {
    if (!gameRunning || gameOver) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake];
        const head = newSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        if (!isInCircle(newHead.x, newHead.y) || newSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          setGameRunning(false);
          return prevSnake;
        }

        newSnake.unshift(newHead);


        if (newHead.x === food.x && newHead.y === food.y) {
          setFood(getRandomFoodPosition());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, GameSpeed);

    return () => clearInterval(interval);
    
  }, [direction, food, gameRunning, gameOver]);

  const handleStart = () => {
    setSnake([{ x: 0, y: 0 }]);
    setDirection({ x: 1, y: 0 });
    setFood(getRandomFoodPosition());
    setGameOver(false);
    setGameRunning(true);
  };

  return (
    <div className="App">
      <canvas
        ref={canvasRef}
        width={CircleRadius * 2 * SegmentSize}
        height={CircleRadius * 2 * SegmentSize}
      />
      {!gameRunning && !gameOver && <button onClick={handleStart}>Start</button>}
      {gameOver && <div className="game-over">Game Over! <button onClick={handleStart}>Restart</button></div>}
    </div>
  );
};

export default App;
