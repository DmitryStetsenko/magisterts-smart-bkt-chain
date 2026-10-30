'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  Award, 
  RotateCcw, 
  X,
  Lock,
  Unlock
} from 'lucide-react';
import { DiagnosticQuestionDto } from '@sbc/types';

interface TestOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleTitle: string;
  moduleSlug: string;
  questions: DiagnosticQuestionDto[];
  onSuccess: (moduleSlug: string) => void;
}

export const TestOutModal: React.FC<TestOutModalProps> = ({
  isOpen,
  onClose,
  moduleTitle,
  moduleSlug,
  questions,
  onSuccess,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const isPassed = correctAnswersCount >= Math.ceil(totalQ * 0.7);

  const handleSelectOption = (optionId: string) => {
    if (answered) return;
    setSelectedOptionId(optionId);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOptionId || answered) return;
    setAnswered(true);

    const chosenOption = currentQ.options.find(opt => opt.id === selectedOptionId);
    if (chosenOption?.isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < totalQ) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setAnswered(false);
    } else {
      setIsFinished(true);
      if (isPassed || (currentQ.options.find(opt => opt.id === selectedOptionId)?.isCorrect && (correctAnswersCount + 1) >= Math.ceil(totalQ * 0.7))) {
        onSuccess(moduleSlug);
      }
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setAnswered(false);
    setCorrectAnswersCount(0);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Шапка модального вікна */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  ⚡ Експрес-екстерн (Test-Out)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                  {currentIndex + 1} з {totalQ}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white truncate max-w-md">
                {moduleTitle}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Прогрес-індикатор */}
        <div className="w-full bg-slate-800 h-1">
          <div 
            className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + (isFinished ? 1 : 0)) / totalQ) * 100}%` }}
          />
        </div>

        {/* Тіло челенджу */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {!isFinished ? (
            <>
              <div className="text-sm font-semibold text-slate-100 leading-relaxed">
                {currentQ.question}
              </div>

              {currentQ.codeSnippet && (
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed shadow-inner">
                  <code>{currentQ.codeSnippet}</code>
                </pre>
              )}

              {/* Варіанти відповідей */}
              <div className="flex flex-col gap-2.5 mt-2">
                {currentQ.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  let optionStyles = 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40';

                  if (answered) {
                    if (option.isCorrect) {
                      optionStyles = 'border-emerald-500/80 bg-emerald-500/15 text-emerald-200 font-semibold';
                    } else if (isSelected && !option.isCorrect) {
                      optionStyles = 'border-rose-500/80 bg-rose-500/15 text-rose-200';
                    } else {
                      optionStyles = 'border-slate-800/50 bg-slate-950/30 text-slate-500 opacity-60';
                    }
                  } else if (isSelected) {
                    optionStyles = 'border-amber-500/80 bg-amber-500/15 text-white font-semibold ring-1 ring-amber-500/50';
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      disabled={answered}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start justify-between gap-3 cursor-pointer ${optionStyles}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono shrink-0 bg-slate-800/80 border border-slate-700 text-slate-300 mt-0.5">
                          {option.id.split('-').pop()}
                        </span>
                        <div className="flex flex-col gap-1">
                          <span>{option.text}</span>
                          {answered && option.explanation && (
                            <span className="text-[11px] text-slate-400 font-normal italic mt-0.5">
                              💡 {option.explanation}
                            </span>
                          )}
                        </div>
                      </div>
                      {answered && option.isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {answered && isSelected && !option.isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Підсумок екстерну */
            <div className="py-6 flex flex-col items-center text-center gap-4 animate-fadeIn">
              {isPassed ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Unlock className="w-8 h-8 animate-bounce" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono uppercase font-bold text-emerald-400 tracking-wider">
                      Рівень майстерності P(L) = 0.95 🚀
                    </span>
                    <h4 className="text-lg font-bold text-white">
                      Модуль успішно зараховано екстерном!
                    </h4>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed mt-1">
                      Ти продемонстрував надійне розуміння матеріалу ({correctAnswersCount}/{totalQ}). Замок знято — наступні теми курсу розблоковано!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono uppercase font-bold text-rose-400 tracking-wider">
                      Результат: {correctAnswersCount}/{totalQ} правильних
                    </span>
                    <h4 className="text-lg font-bold text-white">
                      Потрібно ще трохи закріпити базу
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mt-1">
                      Для екстерну потрібно щонайменше 70% успішних відповідей. Рекомендуємо опрацювати короткий блок теорії та спробувати знову.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Футер із кнопками */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
          {!isFinished ? (
            <>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
              >
                Скасувати
              </button>
              {!answered ? (
                <button
                  onClick={handleConfirmAnswer}
                  disabled={!selectedOptionId}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                >
                  <span>Підтвердити відповідь</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30"
                >
                  <span>{currentIndex + 1 < totalQ ? 'Наступне питання' : 'Переглянути результат'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              {!isPassed && (
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Спробувати ще раз</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="ml-auto px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30"
              >
                <span>{isPassed ? 'Перейти до навчання 🚀' : 'Зрозуміло'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
