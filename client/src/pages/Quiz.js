import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ChevronRight, Check } from 'lucide-react';

const Quiz = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

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

  const nextStep = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Submit quiz and get recommendations
      console.log('Quiz answers:', answers);
      navigate('/products?quiz=true');
    }
  };

  const currentQuestion = questions[step];
  const currentAnswer = answers[currentQuestion?.id] || (currentQuestion?.multiple ? [] : '');

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-maroon">Step {step + 1} of {questions.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(((step + 1) / questions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-cream-dark rounded-full h-2">
            <div 
              className="bg-maroon rounded-full h-2 transition-all duration-300"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Quiz Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-maroon/10 rounded-full mb-4">
              <Sparkles className="text-maroon" size={32} />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              {currentQuestion?.question}
            </h2>
            <p className="text-muted-foreground mt-2">
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
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex justify-between items-center
                    ${isSelected 
                      ? 'border-maroon bg-maroon/5' 
                      : 'border-cream-dark hover:border-maroon/50'
                    }`}
                >
                  <span className="font-medium">{option}</span>
                  {isSelected && <Check className="text-maroon" size={20} />}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex gap-4">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 border-2 border-maroon text-maroon py-3 rounded-lg font-semibold hover:bg-maroon hover:text-white transition"
              >
                Back
              </button>
            )}
            <button
              onClick={nextStep}
              disabled={!currentAnswer || (currentQuestion.multiple && currentAnswer.length === 0)}
              className="flex-1 bg-maroon text-white py-3 rounded-lg font-semibold hover:bg-maroon-light transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {step === questions.length - 1 ? 'Get Recommendations' : 'Next'}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button 
            onClick={() => navigate('/products')}
            className="text-muted-foreground hover:text-maroon text-sm"
          >
            Skip quiz and browse all products →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;