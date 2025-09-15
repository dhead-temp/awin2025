import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, ShieldCheck, BadgeCheck, CircleDollarSign } from 'lucide-react';
import type { Page } from '../App';

interface QuizProcessingProps {
  onNavigate: (page: Page) => void;
}

type Step = {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done';
};

const QuizProcessing: React.FC<QuizProcessingProps> = ({ onNavigate }) => {
  const [steps, setSteps] = useState<Step[]>([
    { id: 'answers', label: 'Validating Answers', status: 'active' },
    { id: 'device', label: 'Validating Unique Device', status: 'pending' },
    { id: 'eligibility', label: 'Checking Eligibility', status: 'pending' },
    { id: 'amount', label: 'Fetching Winning Amount', status: 'pending' }
  ]);

  useEffect(() => {
    const stepsCount = 4;
    let currentIndex = 0;
    const timeouts: number[] = [];

    const advance = () => {
      setSteps(prev => {
        const next = [...prev];
        // mark current as done
        if (currentIndex < next.length) {
          next[currentIndex].status = 'done';
        }
        // advance index
        currentIndex += 1;
        if (currentIndex < next.length) {
          next[currentIndex].status = 'active';
        }
        return next;
      });

      if (currentIndex < stepsCount) {
        const t = window.setTimeout(advance, 900 + Math.random() * 700);
        timeouts.push(t);
      } else {
        const t = window.setTimeout(() => onNavigate('win'), 600);
        timeouts.push(t);
      }
    };

    // start sequence
    const t0 = window.setTimeout(advance, 900);
    timeouts.push(t0);

    // safety redirect in case of any hiccup
    const safety = window.setTimeout(() => onNavigate('win'), 10000);
    timeouts.push(safety);

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  }, [onNavigate]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              Processing your result
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mt-3">
              Please wait a moment
            </h1>
            <p className="text-gray-600 text-sm mt-1">This may take a few seconds</p>
          </div>

          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center justify-between border rounded-2xl px-4 py-3 ${
                  step.status === 'done'
                    ? 'bg-green-50 border-green-200'
                    : step.status === 'active'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-inner ${
                    step.status === 'done'
                      ? 'bg-green-100'
                      : step.status === 'active'
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                  }`}>
                    {step.id === 'answers' && (
                      step.status === 'active' ? <Loader2 className="h-5 w-5 text-blue-600 animate-spin" /> : <CheckCircle2 className={`h-5 w-5 ${step.status==='done' ? 'text-green-600' : 'text-gray-400'}`} />
                    )}
                    {step.id === 'device' && (
                      step.status === 'active' ? <ShieldCheck className="h-5 w-5 text-blue-600 animate-pulse" /> : <CheckCircle2 className={`h-5 w-5 ${step.status==='done' ? 'text-green-600' : 'text-gray-400'}`} />
                    )}
                    {step.id === 'eligibility' && (
                      step.status === 'active' ? <BadgeCheck className="h-5 w-5 text-blue-600 animate-pulse" /> : <CheckCircle2 className={`h-5 w-5 ${step.status==='done' ? 'text-green-600' : 'text-gray-400'}`} />
                    )}
                    {step.id === 'amount' && (
                      step.status === 'active' ? <CircleDollarSign className="h-5 w-5 text-blue-600 animate-bounce" /> : <CheckCircle2 className={`h-5 w-5 ${step.status==='done' ? 'text-green-600' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-800">{step.label}</div>
                </div>
                <div>
                  {step.status === 'active' && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
                  {step.status === 'done' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <div className="text-xs text-gray-500 mb-3">Securing your prize…</div>
            <button
              onClick={() => onNavigate('win')}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Continue to results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizProcessing;


