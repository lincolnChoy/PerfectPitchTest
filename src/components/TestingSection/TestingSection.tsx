import React from 'react'
import { connect } from 'react-redux'
import { checkFilenameCondition, formatNote } from '../../utility/notes'
import Button from '../StyledComponents/Button/Button'
import allNotes from './allNotes'

interface IProps {
    ordered: any[]
    instrument: string
}

interface SelectedNoteButton {
    note: string,
    status: string
}

class TestingSection extends React.Component<IProps, any> {
    state = {
        currentNote: "",
        currentSelectedNote: "",
        nextQuestion: true,
        questionCorrectlyAnswered: true,
        questionFinished: false,
        showAnswerFeedback: false,
        correctAnswers: 0,
        totalAnswers: 0,
        selectedAnswersStatus: []
    }
    
    componentDidMount = () => {
        this.playAudio()
    }

    pickRandomNote = () => {
        let selectedNotes = this.props.ordered.slice();
        let randomIndex = Math.floor(Math.random() * selectedNotes.length)
        let note = selectedNotes[randomIndex]

        note.replace("♯/", "#").replace("♭", "b")

        let notes: string[] = []

        allNotes.Piano.forEach(fileNote => {
            checkFilenameCondition(note, fileNote) && notes.push(fileNote)
        })

        randomIndex = Math.floor(Math.random() * notes.length)
        return notes[randomIndex]
    }

    playNext = () => {
        this.setState({ nextQuestion: true, questionFinished: false, showAnswerFeedback: false, selectedAnswersStatus: [] })
        this.playAudio()
    }

    playAudio = () => {
        let randomNote
        if (this.state.nextQuestion) {
            randomNote = this.pickRandomNote()
            this.setState({ currentNote: randomNote, nextQuestion: false })
        }
        let audio = new Audio(`sounds/Piano/${this.state.nextQuestion ? randomNote : this.state.currentNote}`)
        audio.play()
    }

    pickAnswer = (note: string) => {
        if (!this.state.questionFinished){
            let selected: SelectedNoteButton[] = this.state.selectedAnswersStatus.slice()

            if (checkFilenameCondition(note, this.state.currentNote)) {
                if (this.state.questionCorrectlyAnswered) {
                    this.setState({correctAnswers: this.state.correctAnswers + 1, totalAnswers: this.state.totalAnswers + 1, questionFinished: true })
                }
                else {
                    this.setState({ questionCorrectlyAnswered: true, questionFinished: true })
                }

                //TODO: make this not push duplicates
                selected.push({note: note, status: 'correct'})
            }
            else {
                this.setState({ totalAnswers: this.state.questionCorrectlyAnswered ? this.state.totalAnswers + 1 : this.state.totalAnswers, questionCorrectlyAnswered: false })
                //TODO: make this not push duplicates
                selected.push({note: note, status: 'incorrect'})
            }
            
            this.setState({ currentSelectedNote: note, showAnswerFeedback: true, selectedAnswersStatus: selected });
        }
    }

    checkArray = (array: SelectedNoteButton[], note: string) => {
        for (let element of array) {
            if (note === element.note) {
                return element.status
            }
        }
        return false
    }
    render() {
        let { correctAnswers, totalAnswers, questionCorrectlyAnswered, currentSelectedNote, showAnswerFeedback, selectedAnswersStatus, questionFinished } = this.state;
        return (
            <div className="test-container container-flex-column-center">
                <h1>Perfect Pitch Test</h1>
                <div>Score: {correctAnswers} / {totalAnswers} correct</div>
                <div>
                    { questionFinished && <Button onClick={this.playNext}>Hear Next</Button>}
                    <Button onClick={this.playAudio}>Play Note</Button>
                </div>
                {
                    showAnswerFeedback ?
                    (!questionCorrectlyAnswered 
                    ? <p>Nope, "{ currentSelectedNote }" is not correct.</p>
                    : <p>Nice! "{ currentSelectedNote }" is correct!</p>
                    )
                    : <p className="hide-p">If you can see this, you're cool :)</p>
                }
                <h1>Choices</h1>
                <div>
                    {this.props.ordered.map(note => (
                        <Button status={this.checkArray(selectedAnswersStatus, note)} onClick={() => this.pickAnswer(note)}>{formatNote(note)}</Button>
                    ))}
                </div>
            </div>
        )
    }
}

export default connect(null, null)(TestingSection)