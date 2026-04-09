import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, ChevronRight, Check, Sun, Moon, ShoppingBag, 
  Droplet, Wind, Flame, Eye, AlertCircle, Shield,
  Activity, Battery, Heart, Zap, Feather, Star, Flower2, Leaf
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Quiz = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answers, setAnswers] = useState({
    skinType: '',
    skinConcerns: [],
    hairConcerns: [],
    allergies: [],
    routineTime: 'both'
  });

  const questions = [
    {
      id: 'skinType',
      question: 'What is your skin type?',
      description: 'This helps us recommend the right products for you',
      options: [
        { value: 'oily', label: 'Oily', icon: Droplet, description: 'Shiny appearance, enlarged pores' },
        { value: 'dry', label: 'Dry', icon: Wind, description: 'Tight, flaky, rough texture' },
        { value: 'combination', label: 'Combination', icon: Activity, description: 'Oily T-zone, dry cheeks' },
        { value: 'normal', label: 'Normal', icon: Feather, description: 'Balanced, not too oily or dry' },
        { value: 'sensitive', label: 'Sensitive', icon: Heart, description: 'Easily irritated, redness prone' }
      ]
    },
    {
      id: 'skinConcerns',
      question: 'What are your main skin concerns?',
      description: 'Select all that apply',
      multiple: true,
      options: [
        { value: 'acne', label: 'Acne & Breakouts', icon: Zap },
        { value: 'aging', label: 'Fine Lines & Wrinkles', icon: Eye },
        { value: 'darkSpots', label: 'Dark Spots & Hyperpigmentation', icon: Star },
        { value: 'dryness', label: 'Dryness & Dehydration', icon: Droplet },
        { value: 'dullness', label: 'Dullness & Uneven Texture', icon: Feather },
        { value: 'redness', label: 'Redness & Inflammation', icon: Flame }
      ]
    },
    {
      id: 'hairConcerns',
      question: 'What are your hair concerns?',
      description: 'Select all that apply',
      multiple: true,
      options: [
        { value: 'hairFall', label: 'Hair Fall', icon: Activity },
        { value: 'dandruff', label: 'Dandruff', icon: AlertCircle },
        { value: 'frizz', label: 'Frizz & Dryness', icon: Wind },
        { value: 'slowGrowth', label: 'Slow Growth', icon: Battery },
        { value: 'damage', label: 'Heat/Color Damage', icon: Zap }
      ]
    },
    {
      id: 'allergies',
      question: 'Any ingredients you want to avoid?',
      description: 'Select any ingredients you are allergic or sensitive to',
      multiple: true,
      options: [
        { value: 'fragrance', label: 'Fragrance/Parfum', icon: Flower2 },
        { value: 'sulfates', label: 'Sulfates (SLS/SLES)', icon: Droplet },
        { value: 'parabens', label: 'Parabens', icon: Shield },
        { value: 'alcohol', label: 'Drying Alcohols', icon: Wind },
        { value: 'essentialOils', label: 'Essential Oils', icon: Leaf }
      ]
    }
  ];

  const currentQuestion = questions[step];

  const updateAnswer = (questionId, value, isMultiple = false) => {
    if (isMultiple) {
      const current = answers[questionId] || [];
      if (current.includes(value)) {
        setAnswers({ ...answers, [questionId]: current.filter(v => v !== value) });
      } else {
        setAnswers({ ...answers, [questionId]: [...current, value] });
      }
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  const nextStep = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      submitQuiz();
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/quiz/submit`, answers, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRecommendations(response.data);
      setQuizCompleted(true);
      
      localStorage.setItem('quizCompleted', 'true');
      localStorage.setItem('quizRecommendations', JSON.stringify(response.data));
      
    } catch (error) {
      console.error('Quiz submission error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === product._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ 
        id: product._id, 
        name: product.name, 
        price: product.price, 
        quantity: 1, 
        image: product.images?.[0] 
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  // Show recommendations after quiz completion
  if (quizCompleted) {
    const amProducts = recommendations.filter(p => p.routineTime === 'AM' || p.routineTime === 'both');
    const pmProducts = recommendations.filter(p => p.routineTime === 'PM' || p.routineTime === 'both');
    
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <Sparkles className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-800">Your Personalized Routine</h1>
          <p className="text-gray-600 mt-2">Based on your answers, we've curated these products for you</p>
        </div>

        {/* AM Routine */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sun className="h-6 w-6 text-amber-500" />
            <h2 className="text-xl font-semibold">Morning Routine</h2>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">AM</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {amProducts.slice(0, 4).map((product, idx) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="relative">
                  <img src={product.images?.[0] || '/api/placeholder/300/200'} alt={product.name} className="w-full h-48 object-cover" />
                  <div className="absolute top-2 left-2 w-8 h-8 bg-maroon text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xl font-bold text-maroon">₹{product.price}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="bg-maroon text-white px-3 py-1 rounded-lg text-sm hover:bg-maroon-light"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PM Routine */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="h-6 w-6 text-indigo-500" />
            <h2 className="text-xl font-semibold">Evening Routine</h2>
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">PM</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pmProducts.slice(0, 4).map((product, idx) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="relative">
                  <img src={product.images?.[0] || '/api/placeholder/300/200'} alt={product.name} className="w-full h-48 object-cover" />
                  <div className="absolute top-2 left-2 w-8 h-8 bg-maroon text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xl font-bold text-maroon">₹{product.price}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="bg-maroon text-white px-3 py-1 rounded-lg text-sm hover:bg-maroon-light"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="border-2 border-maroon text-maroon px-6 py-2 rounded-lg hover:bg-maroon hover:text-white transition"
          >
            Go to Dashboard
          </button>
          <button 
            onClick={() => navigate('/products')}
            className="bg-maroon text-white px-6 py-2 rounded-lg hover:bg-maroon-light transition"
          >
            Browse All Products
          </button>
        </div>
      </div>
    );
  }

  const currentValue = answers[currentQuestion?.id];
  const isMultiple = currentQuestion?.multiple;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-maroon">Step {step + 1} of {questions.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(((step + 1) / questions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-cream-dark rounded-full h-2">
            <div 
              className="bg-maroon rounded-full h-2 transition-all duration-300"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-maroon/10 rounded-full mb-4">
              <Sparkles className="text-maroon" size={32} />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              {currentQuestion?.question}
            </h2>
            <p className="text-muted-foreground mt-2">{currentQuestion?.description}</p>
          </div>

          <div className="space-y-3">
            {currentQuestion?.options.map((option) => {
              const IconComponent = option.icon;
              const isSelected = isMultiple 
                ? (currentValue || []).includes(option.value)
                : currentValue === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => updateAnswer(currentQuestion.id, option.value, isMultiple)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4
                    ${isSelected 
                      ? 'border-maroon bg-maroon/5' 
                      : 'border-cream-dark hover:border-maroon/50'
                    }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center">
                    <IconComponent size={20} className={isSelected ? 'text-maroon' : 'text-gray-500'} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-gray-500">{option.description}</div>
                    )}
                  </div>
                  {isSelected && <Check className="text-maroon" size={20} />}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex gap-4">
            {step > 0 && (
              <button
                onClick={prevStep}
                className="flex-1 border-2 border-maroon text-maroon py-3 rounded-xl font-semibold hover:bg-maroon hover:text-white transition"
              >
                Back
              </button>
            )}
            <button
              onClick={nextStep}
              disabled={!currentValue || (isMultiple && currentValue.length === 0) || loading}
              className="flex-1 bg-maroon text-white py-3 rounded-xl font-semibold hover:bg-maroon-light transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {step === questions.length - 1 ? (
                loading ? 'Analyzing...' : 'Get My Recommendations'
              ) : (
                <>Next <ChevronRight size={18} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;