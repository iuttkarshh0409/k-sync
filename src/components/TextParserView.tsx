import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FileText,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Wind,
  Flame,
  ArrowRight,
  Mic,
  Square,
} from 'lucide-react';
import { useKitchen } from '../context/KitchenContext';
import { parseOrderText } from '../utils/kitchenRules';

type SpeechRecognitionResultEvent = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export const TextParserView: React.FC<{ onDispatched: () => void }> = ({ onDispatched }) => {
  const { menu, placeOrder, addToCart } = useKitchen();
  const [inputText, setInputText] = useState('2 veg momo 1 chicken hakka noodles fast');
  const [toast, setToast] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const toggleDictation = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Voice input is not supported in this browser. Try the latest Chrome or Edge.');
      return;
    }

    setSpeechError(null);
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length - event.resultIndex }, (_, index) => {
        const result = event.results[event.resultIndex + index];
        return result.isFinal ? result[0].transcript.trim() : '';
      }).filter(Boolean).join(' ');

      if (transcript) {
        setInputText((current) => `${current.trim()} ${transcript}`.trim());
      }
    };
    recognition.onerror = (event) => {
      const message = event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'Microphone access was blocked. Allow microphone access in your browser and try again.'
        : event.error === 'no-speech'
          ? 'No speech was detected. Try speaking again.'
          : `Voice input stopped (${event.error}). Please try again.`;
      setSpeechError(message);
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      setSpeechError('Could not start voice input. Check microphone permissions and try again.');
    }
  };

  const parsed = useMemo(() => {
    return parseOrderText(inputText, menu);
  }, [inputText, menu]);

  const samplePrompts = [
    '2 veg momo 1 chicken hakka noodles fast',
    '1 chicken momo 2 veg fried rice asap',
    '3 crispy fried momo 1 chilli paneer urgent',
    '2 steamed veg momos and 1 hakka noodles',
  ];

  const handleSendToKitchen = () => {
    if (!parsed.valid) return;

    const validItems = parsed.items.filter((i) => i.validation === 'valid');
    const order = placeOrder({
      items: validItems.map((i) => ({
        menu_item_id: i.menu_item_id!,
        quantity: i.quantity!,
      })),
      priority_note: parsed.priority_note,
      source_text: inputText,
    });

    setToast(`Order ${order.id} scheduled directly from natural language intake!`);
    setTimeout(() => setToast(null), 4000);
    onDispatched();
  };

  const handleAddToCart = () => {
    if (!parsed.valid) return;
    const validItems = parsed.items.filter((i) => i.validation === 'valid');
    validItems.forEach((i) => addToCart(i.menu_item_id!, i.quantity!));
    setToast('Added parsed items to order cart!');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#201f1c] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-8 border border-[#ece8df] shadow-2xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#f4f1ea] px-3 py-1 rounded-full text-xs font-bold text-[#6d6a62] mb-3 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-[#d96d4c]" />
            <span>Smart Natural Language Intake</span>
          </div>
          <h2 className="font-athelas text-3xl font-bold text-[#201f1c]">
            Natural Language Order Parser
          </h2>
          <p className="mt-2 text-xs text-[#79766e] leading-relaxed">
            Staff and aggregators can paste shorthand orders. The system tokenizes dish aliases across Momobuzz and Woksum, detects quantities, checks maximum caps (1–50), and flags rush instructions.
          </p>
        </div>
      </div>

      {/* Main Grid: Input & Parsed Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Textarea & Prompts (6 columns) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#ece8df] shadow-2xs space-y-4">
          <label className="block text-xs font-bold text-[#201f1c] uppercase tracking-wider">
            Enter Natural Language Order Text
          </label>

          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. 2 veg momo 1 chicken hakka noodles fast"
            className="w-full text-sm font-medium p-4 bg-[#fbf9f5] border border-[#e8e4db] rounded-2xl outline-none focus:border-[#201f1c] transition resize-none text-[#201f1c]"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleDictation}
              aria-pressed={isListening}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                isListening
                  ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  : 'bg-[#201f1c] text-white hover:bg-[#383631]'
              }`}
            >
              {isListening ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-4 h-4" />}
              <span>{isListening ? 'Stop voice input' : 'Speak an order'}</span>
            </button>
            <span className="text-[11px] text-[#79766e]">
              {isListening ? 'Listening… speak clearly, then stop when finished.' : 'Dictated words appear here for review.'}
            </span>
          </div>

          {speechError && (
            <div role="status" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{speechError}</span>
            </div>
          )}

          <div>
            <span className="text-[11px] font-bold text-[#79766e] uppercase tracking-wider block mb-2">
              Try Sample Shorthands:
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(prompt)}
                  className="text-xs bg-[#f4f1ea] hover:bg-[#eae6dc] text-[#4d4b45] px-3 py-1.5 rounded-xl transition text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Parsed Chips & Dispatch (6 columns) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#ece8df] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f1efe9]">
            <h3 className="font-athelas text-lg font-bold text-[#201f1c]">
              Parsed Entities & Breakdown
            </h3>
            {parsed.valid ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All items recognized</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Parsing error</span>
              </span>
            )}
          </div>

          {/* Priority Note Flag */}
          {parsed.priority_note && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Priority Instruction Detected:</span>
              </span>
              <span className="font-mono font-bold uppercase tracking-wider bg-amber-200 px-2 py-0.5 rounded-md text-[11px]">
                {parsed.priority_note}
              </span>
            </div>
          )}

          {/* Parsed Dishes List */}
          <div className="space-y-3">
            {parsed.items.map((item, idx) => {
              if (item.validation === 'error') {
                return (
                  <div
                    key={idx}
                    className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800"
                  >
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{item.error}</span>
                  </div>
                );
              }

              const isMomo = item.brand === 'Momobuzz';
              return (
                <div
                  key={idx}
                  className="p-4 bg-[#fbf9f5] rounded-2xl border border-[#ece8df] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isMomo ? 'bg-[#fff8f5] text-[#d96d4c] border border-[#f4d8ce]' : 'bg-[#f6faf5] text-[#527d58] border border-[#d5e4d4]'
                      }`}
                    >
                      {isMomo ? <Wind className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
                    </div>

                    <div>
                      <span className="font-athelas text-base font-bold text-[#201f1c] block">
                        {item.quantity}× {item.name}
                      </span>
                      <span className="text-[11px] text-[#79766e]">
                        {item.brand} · {item.station} station
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#201f1c] block">
                      ~{item.duration_minutes}m
                    </span>
                    <span className="text-[10px] text-[#527d58] font-semibold">Valid</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          {parsed.valid && (
            <div className="pt-3 border-t border-[#f1efe9] flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSendToKitchen}
                className="flex-1 py-3 bg-[#201f1c] hover:bg-[#383631] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Directly to Kitchen</span>
              </button>

              <button
                onClick={handleAddToCart}
                className="py-3 px-4 bg-[#f4f1ea] hover:bg-[#eae6dc] text-[#201f1c] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Add to Cart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
