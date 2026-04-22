import { useState, useEffect, useRef } from 'react';

function TextInput({ question, value, onChange, onSubmit }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="flex flex-col gap-4">
      <input
        ref={ref}
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && value?.trim() && onSubmit()}
        placeholder={question.placeholder}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 text-white text-lg placeholder-zinc-600 focus:outline-none focus:border-[#00ff87] transition-colors"
      />
      <button
        onClick={onSubmit}
        disabled={!value?.trim()}
        className="btn-primary self-start px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide disabled:opacity-30 disabled:pointer-events-none"
      >
        Continue →
      </button>
    </div>
  );
}

function NumberInput({ question, value, onChange, onSubmit }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const num = Number(value);
  const valid =
    value !== '' &&
    value !== undefined &&
    !isNaN(num) &&
    num >= (question.min || 0) &&
    num <= (question.max || 9999);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <input
          ref={ref}
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && valid && onSubmit()}
          placeholder={question.placeholder}
          min={question.min}
          max={question.max}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 text-white text-lg placeholder-zinc-600 focus:outline-none focus:border-[#00ff87] transition-colors"
          style={{ MozAppearance: 'textfield' }}
        />
        {question.unit && (
          <span className="text-zinc-400 font-medium whitespace-nowrap">{question.unit}</span>
        )}
      </div>
      <button
        onClick={onSubmit}
        disabled={!valid}
        className="btn-primary self-start px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide disabled:opacity-30 disabled:pointer-events-none"
      >
        Continue →
      </button>
    </div>
  );
}

function NumberUnitInput({ question, value, unit, onValueChange, onUnitChange, onSubmit }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const num = Number(value);
  const valid = value !== '' && value !== undefined && !isNaN(num) && num > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <input
          ref={ref}
          type="number"
          value={value ?? ''}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && valid && onSubmit()}
          placeholder={question.placeholder}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 text-white text-lg placeholder-zinc-600 focus:outline-none focus:border-[#00ff87] transition-colors"
          style={{ MozAppearance: 'textfield' }}
        />
        <div className="flex rounded-xl overflow-hidden border border-zinc-700">
          {question.units.map((u) => (
            <button
              key={u}
              onClick={() => onUnitChange(u)}
              className={`px-5 py-4 text-sm font-bold transition-all ${
                unit === u
                  ? 'bg-lime-400 text-zinc-900'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={onSubmit}
        disabled={!valid}
        className="btn-primary self-start px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide disabled:opacity-30 disabled:pointer-events-none"
      >
        Continue →
      </button>
    </div>
  );
}

function SingleSelect({ question, value, onChange, onSubmit }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              onChange(opt.value);
              // Auto-advance after a brief moment
              setTimeout(() => onSubmit(opt.value), 180);
            }}
            className={`option-card flex items-center gap-3 rounded-xl px-4 py-4 text-left ${
              value === opt.value ? 'selected' : ''
            }`}
          >
            <span className="text-2xl flex-shrink-0">{opt.icon}</span>
            <span className="text-sm font-medium text-zinc-200">{opt.label}</span>
            {value === opt.value && (
              <span className="ml-auto text-[#00ff87] text-lg">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiSelect({ question, value = [], onChange, onSubmit }) {
  const noneVal = question.noneValue;

  const toggle = (optVal) => {
    if (noneVal && optVal === noneVal) {
      onChange([noneVal]);
      return;
    }
    const current = value.filter((v) => v !== noneVal);
    if (current.includes(optVal)) {
      onChange(current.filter((v) => v !== optVal));
    } else {
      onChange([...current, optVal]);
    }
  };

  const isSelected = (optVal) => value.includes(optVal);
  const canProceed = value.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-zinc-500 uppercase tracking-widest">Select all that apply</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`option-card flex items-center gap-3 rounded-xl px-4 py-4 text-left ${
              isSelected(opt.value) ? 'selected' : ''
            }`}
          >
            <span className="text-2xl flex-shrink-0">{opt.icon}</span>
            <span className="text-sm font-medium text-zinc-200">{opt.label}</span>
            {isSelected(opt.value) && (
              <span className="ml-auto text-[#00ff87] text-lg">✓</span>
            )}
          </button>
        ))}
      </div>
      <button
        onClick={onSubmit}
        disabled={!canProceed}
        className="btn-primary self-start px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide disabled:opacity-30 disabled:pointer-events-none"
      >
        Continue →
      </button>
    </div>
  );
}

function TextareaInput({ question, value, onChange, onSubmit }) {
  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        rows={4}
        autoFocus
        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-4 text-white text-base placeholder-zinc-600 focus:outline-none focus:border-[#00ff87] transition-colors resize-none"
      />
      <button
        onClick={onSubmit}
        className="btn-primary self-start px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide"
      >
        {question.optional && !value?.trim() ? 'Skip →' : 'Continue →'}
      </button>
    </div>
  );
}

export default function QuestionCard({
  question,
  answers,
  questionNumber,
  onAnswer,
}) {
  const [localValue, setLocalValue] = useState(() => {
    const field = question.field;
    return answers[field] ?? (question.type === 'multiselect' ? [] : question.type === 'number_unit' ? '' : '');
  });
  const [localUnit, setLocalUnit] = useState(
    () => answers[question.field_unit] || question.defaultUnit || ''
  );

  const trainerText =
    typeof question.trainerText === 'function'
      ? question.trainerText(answers)
      : question.trainerText;

  const handleSubmit = (overrideValue) => {
    const val = overrideValue !== undefined ? overrideValue : localValue;
    const update = { [question.field]: val };
    if (question.field_unit) {
      update[question.field_unit] = localUnit;
    }
    onAnswer(update);
  };

  return (
    <div className="slide-up w-full">
      {/* Question number badge */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-zinc-900"
          style={{ background: 'linear-gradient(135deg, #00ff87, #00cc6a)' }}
        >
          {questionNumber}
        </span>
        <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
          Your trainer asks
        </span>
      </div>

      {/* Trainer question */}
      <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6 leading-snug">
        {trainerText}
      </h2>

      {/* Input based on type */}
      {question.type === 'text' && (
        <TextInput
          question={question}
          value={localValue}
          onChange={setLocalValue}
          onSubmit={handleSubmit}
        />
      )}
      {question.type === 'number' && (
        <NumberInput
          question={question}
          value={localValue}
          onChange={setLocalValue}
          onSubmit={handleSubmit}
        />
      )}
      {question.type === 'number_unit' && (
        <NumberUnitInput
          question={question}
          value={localValue}
          unit={localUnit}
          onValueChange={setLocalValue}
          onUnitChange={setLocalUnit}
          onSubmit={handleSubmit}
        />
      )}
      {question.type === 'single' && (
        <SingleSelect
          question={question}
          value={localValue}
          onChange={setLocalValue}
          onSubmit={handleSubmit}
        />
      )}
      {question.type === 'multiselect' && (
        <MultiSelect
          question={question}
          value={localValue}
          onChange={setLocalValue}
          onSubmit={handleSubmit}
        />
      )}
      {question.type === 'textarea' && (
        <TextareaInput
          question={question}
          value={localValue}
          onChange={setLocalValue}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
