import React, { Component } from 'react'
import Queez from 'queez'
import configSuperHero from './configSuperHero'
import configSurvey from './configSurvey'
import JSONTree from 'react-json-tree'

const superHeroQuizzCompleteCallback = quizz => {
  return quizz.getResponse().map(result => result.content)
}

const surveyQuizzCompleteCallback = quizz => {
  return quizz.getResponse().map(result => ({question: result.content, answer: result.answers[0].content}))
}

class App extends Component {
  constructor(props) {
    super(props)

    const quizz = new Queez(this.getCompleteConfig(configSuperHero, superHeroQuizzCompleteCallback))
    this.state = {quizz}
  }

  render() {
    const {quizz, results} = this.state
    if (!quizz) return <div>No quizz found :(</div>
    return (
      <div className="App">
        <QuizzTabs reset={(config, callback) => this.reset(config, callback)}/>
        <h1>{quizz.custom.title}</h1>
        <ul>
          {quizz.questions.map((question, i) => {
            return (
              <Question
                question={question}
                key={i}
                respond={(questionId, answerId) => this.respond(questionId, answerId)}
                unRespond={(questionId, answerId) => this.unRespond(questionId, answerId)}
              />
            )})
          }
        </ul>
        {results ? <JSONTree data={results} /> : null}
      </div>
    )
  }

  respond(questionId, answerId) {
    const quizz = this.state.quizz
    quizz.getQuestion(questionId).respond(answerId)
    this.setState({quizz})
  }

  unRespond(questionId, answerId) {
    const quizz = this.state.quizz
    quizz.getQuestion(questionId).unRespond(answerId)
    this.setState({quizz})
  }

  getCompleteConfig(config, callback) {
    config.callbacks = {
      onQuizzComplete: [
        quizz => this.setState({results: callback(quizz)})
      ]
    }
    return config
  }

  reset(config, callback) {
    const quizz = new Queez(this.getCompleteConfig(config, callback))
    this.setState({quizz, results: null})
  }
}

const QuizzTabs = ({reset}) => (
  <div>
    <button onClick={() => reset(configSuperHero, superHeroQuizzCompleteCallback)}>Super hero</button>
    <button onClick={() => reset(configSurvey, surveyQuizzCompleteCallback)}>Survey</button>
  </div>
)

const Question = ({question, respond, unRespond}) => (
  <li>
    <p>{question.content}</p>
    <ul>
      {question.answers.map((answer, i) => {
        return (
          <Answer
            answer={answer}
            key={i}
            respond={answerId => respond(question.id, answerId)}
            unRespond={answerId => unRespond(question.id, answerId)}
            isSelected={question.answersIds.includes(answer.id)}
          />
        )
      })}
    </ul>
  </li>
)

const Answer = ({answer, respond, unRespond, isSelected}) => {
  const style = isSelected ? {color: 'red'} : {}
  const onClick = isSelected ? unRespond : respond
  return <button onClick={() => onClick(answer.id)} style={style}>{answer.content}</button>
}

export default App;
