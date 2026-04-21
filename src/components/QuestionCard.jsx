import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

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
        className="input-field text-lg"
      />
      <button
        onClick={onSubmit}
        disabled={!value?.trim()}
        className="btn-primary"
      >
        Continue
      </button>
    </div>
  );
}

function NumberInput({ question, value, onChange, onSubmit }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const num   = Number(value);
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
          className="input-field text-lg"
          style={{ MozAppearance: 'textfield' }}
        />
        {question.unit && (
          <span className="text-sm font-medium whitespace-nowrap flex-shrink-0" style={{ color: '#888888' }}>
            {question.unit}
          </span>
        )}
      </div>
      <button onClick={onSubmit} disabled={!valid} className="btn-primary">
        Continue
      </button>
    </div>
  );
}

function NumberUnitInput({ question, value, unit, onValueChange, onUnitChange, onSubmit }) {
  const ref   = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const num   = Number(value);
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
          className="input-field text-lg flex-1"
          style={{ MozAppearance: 'textfield' }}
        />
        <div
          className="flex rounded-xl overflow-hidden flex-shrink-0"
          style={{ border: '1.5px solid #333333' }}
        >
          {question.units.map((u) => (
            <button
              key={u}
              onClick={() => onUnitChange(u)}
              className="px-4 text-sm font-bold transition-all"
              style={
                unit === u
                  ? { background: '#00ff87', color: '#000000' }
                  : { background: '#1a1a1a', color: '#888888' }
              }
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      <button onClick={onSubmit} disabled={!valid} className="btn-primary">
        Continue
      </button>
    </div>
  );
}

function SingleSelect({ question, value, onChange, onSubmit }) {
  return (
    <div className="flex flex-col gap-3">
      {question.options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => {
              onChange(opt.value);
              setTimeout(() => onSubmit(opt.value), 160);
            }}
            className="option-card flex items-center gap-4 px-5 py-4 text-left w-full"
            style={
              isSelected
                ? { background: 'rgba(0,255,135,0.08)', borderColor: '#00ff87' }
                : {}
            }
          >
            <span className="text-2xl flex-shrink-0">{opt.icon}</span>
            <span className="text-base font-medium text-white flex-1">{opt.label}</span>
            {isSelected && (
              <span className="ml-auto flex-shrink-0">
                <Check size={18} style={{ color: '#00ff87' }} />
              </span>
            )}
          </button>
        );
      })}
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

  const isSelected  = (optVal) => value.includes(optVal);
  const canProceed  = value.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#555555' }}>
        Select all that apply
      </p>
      {question.options.map((opt) => {
        const sel = isSelected(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className="option-card flex items-center gap-4 px-5 py-4 text-left w-full"
            style={
              sel
                ? { background: 'rgba(0,255,135,0.08)', borderColor: '#00ff87' }
                : {}
            }
          >
            <span className="text-2xl flex-shrink-0">{opt.icon}</span>
            <span className="text-base font-medium text-white flex-1">{opt.label}</span>
            {sel && (
              <span className="ml-auto flex-shrink-0">
                <Check size={18} style={{ color: '#00ff87' }} />
              </span>
            )}
          </button>
        );
      })}
      <button
        onClick={onSubmit}
        disabled={!canProceed}
        className="btn-primary mt-1"
      >
        Continue
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
        className="input-field resize-none text-base leading-relaxed"
        style={{ paddingTop: 16, paddingBottom: 16 }}
      />
      <button onClick={onSubmit} className="btn-primary">
        {question.optional && !value?.trim() ? 'Skip' : 'Continue'}
      </button>
    </div>
  );
}

export default function QuestionCard({ question, answers, questionNumber, onAnswer }) {
  const [localValue, setLocalValue] = useState(() => {
    const field = question.field;
    return answers[field] ?? (
      question.type === 'multiselect' ? [] :
      question.type === 'number_unit' ? '' :
      ''
    );
  });
  const [localUnit, setLocalUnit] = useState(
    () => answers[question.field_unit] || question.defaultUnit || ''
  );

  const trainerText =
    typeof question.trainerText === 'function'
      ? question.trainerText(answers)
      : question.trainerText;

  const handleSubmit = (overrideValue) => {
    const val    = overrideValue !== undefined ? overrideValue : localValue;
    const update = { [question.field]: val };
    if (question.field_unit) update[question.field_unit] = localUnit;
    onAnswer(update);
  };

  return (
    <div className="slide-up w-full">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-black flex-shrink-0"
          style={{ background: '#00ff87' }}
        >
          {questionNumber}
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#555555' }}>
          Your trainer asks
        </span>
      </div>

      {/* Question text */}
      <h2 className="text-2xl font-bold text-white mb-7 leading-snug">
        {trainerText}
      </h2>

      {/* Input */}
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
