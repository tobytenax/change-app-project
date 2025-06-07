import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material';
import { getQuiz, submitQuizAttempt } from '../../slices/quizSlice';
import { setAlert } from '../../slices/alertSlice';

const Quiz = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  
  const { quiz, quizAttempt, loading, error } = useSelector(state => state.quiz);
  
  useEffect(() => {
    dispatch(getQuiz(id));
  }, [dispatch, id]);
  
  const handleAnswerChange = (e) => {
    setAnswers({
      ...answers,
      [currentQuestion]: parseInt(e.target.value)
    });
  };
  
  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };
  
  const handleBack = () => {
    setCurrentQuestion(currentQuestion - 1);
  };
  
  const handleSubmit = async () => {
    try {
      const formattedAnswers = Object.keys(answers).map(questionIndex => ({
        questionIndex: parseInt(questionIndex),
        selectedOption: answers[questionIndex]
      }));
      
      const result = await dispatch(submitQuizAttempt({ 
        proposalId: id, 
        answers: formattedAnswers 
      })).unwrap();
      
      setQuizCompleted(true);
      setQuizResult(result);
      
      if (result.passed) {
        dispatch(setAlert({
          type: 'success',
          message: `Congratulations! You passed the quiz with a score of ${result.score}%. You earned 1 Acent.`
        }));
      } else {
        dispatch(setAlert({
          type: 'warning',
          message: `You didn't pass the quiz. Your score was ${result.score}%. The passing score is ${quiz.passingScore}%.`
        }));
      }
    } catch (err) {
      dispatch(setAlert({
        type: 'error',
        message: err || 'Failed to submit quiz. Please try again.'
      }));
    }
  };
  
  const handleReturnToProposal = () => {
    navigate(`/proposals/${id}`);
  };
  
  if (loading && !quiz) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleReturnToProposal}
          sx={{ mt: 2 }}
        >
          Return to Proposal
        </Button>
      </Container>
    );
  }
  
  if (!quiz) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 2 }}>
          No quiz found for this proposal.
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleReturnToProposal}
          sx={{ mt: 2 }}
        >
          Return to Proposal
        </Button>
      </Container>
    );
  }
  
  if (quizCompleted) {
    return (
      <Container>
        <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Quiz Results
          </Typography>
          
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="h2" color={quizResult.passed ? 'success.main' : 'error.main'}>
              {quizResult.score}%
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
              Passing score: {quiz.passingScore}%
            </Typography>
          </Box>
          
          <Alert severity={quizResult.passed ? 'success' : 'warning'} sx={{ mb: 3 }}>
            {quizResult.passed 
              ? 'Congratulations! You have passed the quiz and can now vote directly on this proposal. You earned 1 Acent.'
              : 'You did not pass the quiz. You can try again or delegate your vote to someone who has passed.'}
          </Alert>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Question Results:
          </Typography>
          
          {quizResult.questionResults && quizResult.questionResults.map((result, index) => (
            <Card key={index} sx={{ mb: 2, bgcolor: result.correct ? 'success.light' : 'error.light' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Question {index + 1}: {quiz.questions[index].questionText}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your answer: {quiz.questions[index].options[result.selectedOption].optionText}
                </Typography>
                {!result.correct && (
                  <Typography variant="body2" color="text.secondary">
                    Correct answer: {quiz.questions[index].options.find(opt => opt.isCorrect).optionText}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {quiz.questions[index].explanation}
                </Typography>
              </CardContent>
            </Card>
          ))}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleReturnToProposal}
            >
              Return to Proposal
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container>
      <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {quiz.title || 'Competence Quiz'}
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          {quiz.description || 'Complete this quiz to demonstrate your understanding of the proposal and earn the right to vote directly.'}
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={currentQuestion} alternativeLabel>
            {quiz.questions.map((question, index) => (
              <Step key={index}>
                <StepLabel>Question {index + 1}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        {quiz.questions && quiz.questions[currentQuestion] && (
          <Box>
            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
              <FormLabel component="legend" sx={{ mb: 2, typography: 'h6' }}>
                {quiz.questions[currentQuestion].questionText}
              </FormLabel>
              <RadioGroup
                value={answers[currentQuestion] !== undefined ? answers[currentQuestion].toString() : ''}
                onChange={handleAnswerChange}
              >
                {quiz.questions[currentQuestion].options.map((option, optionIndex) => (
                  <FormControlLabel
                    key={optionIndex}
                    value={optionIndex.toString()}
                    control={<Radio />}
                    label={option.optionText}
                    sx={{ mb: 1 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={currentQuestion === 0}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={answers[currentQuestion] === undefined}
              >
                {currentQuestion < quiz.questions.length - 1 ? 'Next' : 'Submit'}
              </Button>
            </Box>
          </Box>
        )}
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Quiz;
