import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, Check, Loader2 } from 'lucide-react';
import axios from 'axios';

// Ensure this matches your backend URL
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Quiz = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  const questions = [
    {
      id: 'skinType',
      question: 'What is your skin type?',
      options: ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive']
    },
    {
      id: 'concerns',
      question: 'What are your main skincare concerns?',
      options: ['Acne', 'Aging', 'Hyperpigmentation', 'Dryness', 'Redness', 'Dullness'],
      multiple: true
    },
    {
      id: 'routine',
      question: 'What is your current skincare routine?',
      options: ['Minimal (1-2 steps)', 'Basic (3-4 steps)', 'Extensive (5+ steps)', 'None yet']
    },
    {
      id: 'budget',
      question: 'What is your budget range?',
      options: ['Under ₹1000', '₹1000-₹2500', '₹2500-₹5000', '₹5000+']
    }
  ];

  const handleAnswer = (questionId, answer, isMultiple = false) => {
    if (isMultiple) {
      const currentAnswers = answers[questionId] || [];
      const newAnswers = currentAnswers.includes(answer)
        ? currentAnswers.filter(a => a !== answer)
        : [...currentAnswers, answer];
      setAnswers({ ...answers, [questionId]: newAnswers });
    } else {
      setAnswers({ ...answers, [questionId]: answer });
    }
  };

  const nextStep = async () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setIsGenerating(true);
      try {
        // AI Logic: Artificial delay to simulate analysis for the presentation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 1. Send Quiz answers to the backend
        const response = await axios.post(`${API}/auth/update-skin-profile`, { 
          answers 
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.data.success) {
          // 2. Navigate to dashboard where the routine will be visible
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error saving quiz results:', error);
        // Fallback so the user isn't stuck during a live demo
        navigate('/dashboard');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const currentQuestion = questions[step];
  const currentAnswer = answers[currentQuestion?.id] || (currentQuestion?.multiple ? [] : '');
  const isLastStep = step === questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-maroon font-semibold">Step {step + 1} of {questions.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(((step + 1) / questions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-maroon rounded-full h-2 transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Quiz Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-maroon/10 rounded-full mb-4">
              <Sparkles className="text-maroon" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {currentQuestion?.question}
            </h2>
            <p className="text-gray-500 mt-2">
              Help us personalize your skincare routine
            </p>
          </div>

          <div className="space-y-3">
            {currentQuestion?.options.map((option, idx) => {
              const isSelected = currentQuestion.multiple 
                ? currentAnswer.includes(option)
                : currentAnswer === option;
              
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(currentQuestion.id, option, currentQuestion.multiple)}
                  disabled={isGenerating}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex justify-between items-center
                    ${isSelected 
                      ? 'border-maroon bg-maroon/5 ring-1 ring-maroon' 
                      : 'border-gray-100 hover:border-maroon/30 hover:bg-gray-50'
                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="font-medium text-gray-700">{option}</span>
                  {isSelected && <Check className="text-maroon" size={20} />}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex gap-4">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={isGenerating}
                className="flex-1 border-2 border-maroon text-maroon py-3 rounded-lg font-semibold hover:bg-maroon hover:text-white transition disabled:opacity-50"
              >
                Back
              </button>
            )}
            
            <button
              onClick={nextStep}
              disabled={isGenerating || (currentQuestion.multiple ? currentAnswer.length === 0 : !currentAnswer)}
              className="flex-1 bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Analyzing Skin...
                </>
              ) : (
                <>
                  {isLastStep ? 'Get Recommendations' : 'Next'}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skip Option */}
        {!isGenerating && (
          <div className="text-center mt-6">
            <button 
              onClick={() => navigate('/products')}
              className="text-gray-500 hover:text-maroon text-sm underline underline-offset-4"
            >
              Skip quiz and browse all products →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;