import React from 'react'
import { Row } from 'reactstrap';

const MAX_GRID_SIZE = 20;

export default class GameBoard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            words: ["EAST", "SEAT", "TEA", "EAT", "SET"],
            grid: new Array(MAX_GRID_SIZE).fill(null).map(() => new Array(MAX_GRID_SIZE).fill(null)),
            isVertical: false,
            x: 8,
            y: 8
        }
    }

    componentDidMount = async () => {

        let sortedWords = this.getSortedWordsForStart();

        let isFirst = true;

        for (const word of sortedWords) {
            if (isFirst) { // we have initial x and y in state, so we dont need position at first
                await this.insertWordToBoard(word);
                isFirst = false;
            }
            else {
                await this.setPositionForNextWord(word);
                await this.insertWordToBoard(word);
            }
        }
    }

    insertWordToBoard = (word) => {
        let { grid, x, y, isVertical } = this.state;
        if( !x || !y ) return;
        Object.values(word).forEach(letter => {
            isVertical ? grid[y++][x] = letter
                : grid[y][x++] = letter;
        })
        this.setState({ grid: grid, isVertical: !isVertical });
    }

    setPositionForNextWord = async (word) => {
        let { grid, isVertical } = this.state;
        let index;
        let x, y = 0
        let startX, startY;

        for (y = 0; y < MAX_GRID_SIZE; y++) {
            for (x = 0; x < MAX_GRID_SIZE; x++) {
                index = word.indexOf(grid[y][x]);
                if (index !== -1) {// if we find a letter in grid that associated with current word
                    startX = x;
                    startY = y;
                    if (isVertical) startY = y - index; // if current word should write vertical align, we need to find start grid
                    if (!isVertical) startX = x - index; // it can be also horizontal align, but other align should be in grid's direction which we found
                    console.log(word)
                    if (this.checkSlots(grid, startX, startY, word.length, grid[y][x])) { // if slots not available, searching for the next encounter
                        await this.setState({ x: startX, y: startY });
                        return;
                    }
                }
            }
        }
        await this.setState({x: null, y: null})
    }

    // Check with start position and word length to find that word can write that grids or not
    checkSlots = (grid, x, y, wordLength, letter) => {
        let { isVertical } = this.state;
        if (x < 0 || y < 0) return false;

        if (isVertical) {
            for (let i = 0; i < wordLength; i++) {
                if (grid[y + i][x] === letter) continue; // if we encounter with letter which was we searched, don't do anything. We can rewrite same letter on it 
                if (grid[y + i][x] || y + i >= MAX_GRID_SIZE || this.checkNeighbors(grid, x, y + i, letter)) {
                    return false;
                }

            }
        } else {
            for (let i = 0; i < wordLength; i++) {
                if (grid[y][x + i] === letter) continue; // if we encounter with letter which was we searched, don't do anything. We can rewrite same letter on it 
                if (grid[y][x + i] || x + i >= MAX_GRID_SIZE || this.checkNeighbors(grid, x + i, y, letter)) {
                    return false;
                }
            }
        }
        return true;
    }

    checkNeighbors(grid, x, y, letter) {
        if ((y - 1 >= 0 && grid[y - 1][x] && grid[y - 1][x] !== letter) ||
            (x - 1 >= 0 && grid[y][x - 1] && grid[y][x - 1] !== letter) ||
            (y + 1 < MAX_GRID_SIZE && grid[y + 1][x] && grid[y + 1][x] !== letter) ||
            (x + 1 < MAX_GRID_SIZE && grid[y][x + 1] && grid[y][x + 1] !== letter)) {
            return true;
        }
        else return false;
    }

    //Sorted means each of word has one or more same letter with previous word in array
    getSortedWordsForStart = () => {
        let isSorted = false;
        let words = [];
        while (!isSorted) {
            words = this.shuffle(this.state.words);
            isSorted = true;
            for (let i = 0; i < words.length - 1; i++) {
                if (this.checkNextIncludesPrevsLetter(words[i], words[i + 1])) {
                    continue;
                }
                isSorted = false;
            }
        }
        return words;
    }

    //we can check for find more similarity and sort words but just one same letter okey for this example
    checkNextIncludesPrevsLetter = (prev, next) => {
        let isIncludes = false;
        Object.values(prev).forEach(letter => {
            if (next.indexOf(letter) > -1) {
                isIncludes = true;
            }
        })
        return isIncludes;
    }

    //shuffle's array for fresh start
    shuffle = (array) => {
        var currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {

            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    render() {
        const { grid } = this.state;
        return (
            <div className="grid">
                {
                    grid.map((word, key) => {
                        return <Row key={key}>
                            {
                                word.map((letter, key) => {
                                    return <div className="slot" key={key}>
                                        {letter}
                                    </div>
                                })
                            }
                        </Row>
                    })
                }
            </div>
        )
    }
}
