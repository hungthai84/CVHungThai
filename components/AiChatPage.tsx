import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as Icons from './Icons';
import { useI18n } from '../contexts/i18n';
import { useTheme } from '../contexts/ThemeContext';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import PageLayout from './PageLayout';
import InfoBadge from './InfoBadge';
import { hardcodedAnswers, questionGroups, QuestionGroup } from '../lib/chat-data';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'model';
    isStreaming?: boolean;
    attachment?: {
        type: 'image';
        url: string;
    };
}

interface MediaPrompt {
    key: string;
    title: string;
    icon: keyof typeof Icons;
    embedUrl?: string;
    prompt?: string;
    action?: string;
    questions?: string[];
}

const AiChatPage: React.FC<{ id?: string }> = ({ id }) => {
    const { t, language } = useI18n();
    const pageData = t.aiChatPage;
    const { isAiVoiceOn, selectedAiVoiceName, setAiVoiceOn, aiVoicePitch, aiVoiceRate } = useTheme();
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'collect_info' | 'categories' | 'chat'>('collect_info');
    const [selectedCategory, setSelectedCategory] = useState<MediaPrompt | null>(null);
    const [attachment, setAttachment] = useState<File | null>(null);
    const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
    const [userName, setUserName] = useState('');
    const [userGender, setUserGender] = useState<'Nam' | 'Nữ' | null>(null);
    const [isQuestionsPopupOpen, setIsQuestionsPopupOpen] = useState(false);
    const [showQuestionsBtn, setShowQuestionsBtn] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<QuestionGroup | null>(null);

    const userVoiceName = useMemo(() => {
        if (language === 'vi') {
            return userGender === 'Nữ' ? 'Hoài Minh' : 'Nam Minh';
        }
        return 'Google US English';
    }, [language, userGender]);

    const defaultAiVoiceName = language === 'vi' ? 'Nam Minh' : 'Google US English';
    const aiVoiceToUse = selectedAiVoiceName || defaultAiVoiceName;

    const { speak, cancel, isSpeaking } = useSpeechSynthesis();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { userSalutation, genderDescription } = useMemo(() => {
        if (language === 'vi') {
            if (userGender === 'Nam') return { userSalutation: 'anh', genderDescription: 'male' };
            if (userGender === 'Nữ') return { userSalutation: 'chị', genderDescription: 'female' };
            return { userSalutation: 'Anh/Chị', genderDescription: 'not specified' };
        }
        // English has no formal salutation in this context, but gender description is useful for AI
        return { userSalutation: '', genderDescription: userGender === 'Nam' ? 'male' : userGender === 'Nữ' ? 'female' : 'not specified' };
    }, [userGender, language]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const lastSpokenViewRef = useRef<string | null>(null);

    useEffect(() => {
        if (!isAiVoiceOn) return;
        
        if (view === 'collect_info') {
            if (lastSpokenViewRef.current === 'collect_info') return;
            const initialWelcome = pageData.collectInfoGreeting;
            speak(initialWelcome, { voiceName: aiVoiceToUse, lang: language, pitch: aiVoicePitch, rate: aiVoiceRate });
            lastSpokenViewRef.current = 'collect_info';
        } else if (view === 'categories') {
            if (lastSpokenViewRef.current === 'categories') return;
            const [greeting, ...restOfWelcome] = pageData.welcomeMessage.split('!');
            const personalizedWelcomeMessage = language === 'vi'
                ? `${greeting} ${userSalutation} ${userName}!${restOfWelcome.join('!')}`
                : `${greeting} ${userName}!${restOfWelcome.join('!')}`;
            speak(personalizedWelcomeMessage, { voiceName: aiVoiceToUse, lang: language, pitch: aiVoicePitch, rate: aiVoiceRate });
            lastSpokenViewRef.current = 'categories';
        } else {
            // Clear or set to chat so entering other states can trigger speech again
            lastSpokenViewRef.current = 'chat';
        }
    }, [view, isAiVoiceOn, aiVoiceToUse, language, aiVoicePitch, aiVoiceRate, userName, userSalutation, pageData.welcomeMessage, speak]);

    const startNewChat = () => {
        cancel();
        lastSpokenViewRef.current = null;
        setMessages([]);
        setError(null);
        setView('collect_info');
        setSelectedCategory(null);
        setUserName('');
        setUserGender(null);
    };
    
    const getBase64 = (file: File): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result.split(',')[1]);
                } else {
                    reject(new Error('Failed to read file as base64'));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSend = async (prompt?: string) => {
        const rawInput = prompt || input;
        if (!rawInput.trim() && !attachment) return;
    
        cancel();
        setError(null);
        setIsLoading(true);
        setView('chat');
        setShowQuestionsBtn(false); // Hide button when new message starts
        setIsQuestionsPopupOpen(false); // Close popup if open

        const hardcodedAnswer = hardcodedAnswers[language][rawInput.trim() as keyof typeof hardcodedAnswers[typeof language]];
    
        const userMessage: Message = {
            id: Date.now().toString(),
            text: rawInput,
            sender: 'user',
            ...(attachmentPreview && { attachment: { type: 'image', url: attachmentPreview } })
        };
    
        setMessages(prev => [...prev, userMessage]);
    
        setInput('');
        setAttachment(null);
        setAttachmentPreview(null);
    
        const executeAfterSpeakingUserMessage = (callback: () => void) => {
            if (isAiVoiceOn && rawInput.trim()) {
                speak(rawInput, { voiceName: userVoiceName, lang: language, onEnd: callback });
            } else {
                callback();
            }
        };
    
        if (hardcodedAnswer) {
            const speakModelMessage = () => {
                setIsLoading(false);
                const modelMessage: Message = {
                    id: Date.now().toString() + '-hardcoded',
                    text: hardcodedAnswer,
                    sender: 'model',
                };
                setMessages(prev => [...prev, modelMessage]);
                setShowQuestionsBtn(true); // AI finished hardcoded answer
                if (isAiVoiceOn) {
                    speak(hardcodedAnswer, { voiceName: aiVoiceToUse, lang: language, pitch: aiVoicePitch, rate: aiVoiceRate });
                }
            };
            executeAfterSpeakingUserMessage(speakModelMessage);
            return;
        }
    
        const generateAndSpeakResponse = async () => {
            try {
                let attachmentPayload = null;
                if (attachment) {
                    const base64Data = await getBase64(attachment);
                    attachmentPayload = {
                        data: base64Data,
                        mimeType: attachment.type
                    };
                }

                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        prompt: rawInput,
                        userName,
                        userGender,
                        userSalutation,
                        genderDescription,
                        language,
                        attachment: attachmentPayload,
                        languageNameForAI: t.languageNameForAI
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errMsg = errorData.error || 'Failed to fetch AI response';
                    throw new Error(errMsg);
                }

                setIsLoading(false);

                const reader = response.body?.getReader();
                const decoder = new TextDecoder('utf-8');
                let currentText = '';
                const modelMessageId = Date.now().toString();

                setMessages(prev => [...prev, { id: modelMessageId, text: '', sender: 'model', isStreaming: true }]);

                if (reader) {
                    while (true) {
                        const { value, done } = await reader.read();
                        if (done) break;
                        const chunkText = decoder.decode(value, { stream: true });
                        currentText += chunkText;
                        setMessages(prev => prev.map(msg =>
                            msg.id === modelMessageId ? { ...msg, text: currentText } : msg
                        ));
                    }

                    setMessages(prev => prev.map(msg =>
                        msg.id === modelMessageId ? { ...msg, isStreaming: false } : msg
                    ));

                    setShowQuestionsBtn(true);

                    if (isAiVoiceOn) {
                        speak(currentText, { voiceName: aiVoiceToUse, lang: language, pitch: aiVoicePitch, rate: aiVoiceRate });
                    }
                }
            } catch (err: any) {
                let displayError = err?.message || pageData.errorMessage;
                if (displayError.includes('429') || displayError.includes('RESOURCE_EXHAUSTED') || displayError.includes('Too Many Requests')) {
                    displayError = language === 'vi' 
                        ? 'Hệ thống AI hiện đang hết hạn mức tín dụng (Error 429). Vui lòng nạp thêm tín dụng vào tài khoản Google Cloud của bạn hoặc thử lại sau.'
                        : 'Your AI Studio API credits are depleted (Error 429). Please check your billing or try again later.';
                    console.warn("AI Generation Error (429):", displayError);
                } else {
                    console.error("Error generating content:", err);
                }
                
                setError(displayError);
                setIsLoading(false);
                setMessages(prev => [...prev, { id: Date.now().toString(), text: displayError, sender: 'model' }]);
            }
        };
    
        executeAfterSpeakingUserMessage(generateAndSpeakResponse);
    };
    
    const handleMediaPromptClick = (prompt: MediaPrompt) => {
        if (prompt.action === 'show_categories') {
            setSelectedCategory(null);
            return;
        }
        
        if (prompt.action === 'show_questions') {
            setSelectedCategory(prompt);
            return;
        }
        
        if (prompt.embedUrl) {
            let responseText = '';
            if (prompt.key === 'sampleInterview') {
                responseText = pageData.interviewResponseText;
            }

            const responseMessage: Message = {
                id: Date.now().toString(),
                text: `${responseText}

<iframe src="${prompt.embedUrl}" width="100%" height="315" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`,
                sender: 'model',
            };
            
            setMessages(prev => [...prev, responseMessage]);
            setView('chat');
            if (isAiVoiceOn) {
                speak(responseText, { voiceName: aiVoiceToUse, lang: language, pitch: aiVoicePitch, rate: aiVoiceRate });
            }
        } else if (prompt.prompt) {
            handleSend(prompt.prompt);
        }
    };

    const handleQuestionClick = (question: string) => {
        setIsQuestionsPopupOpen(false);
        setSelectedGroup(null);
        handleSend(question);
    };

    const toggleQuestionsPopup = () => {
        setIsQuestionsPopupOpen(!isQuestionsPopupOpen);
        setSelectedGroup(null);
    };

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAttachment(file);
            setAttachmentPreview(URL.createObjectURL(file));
        }
    };

    const removeAttachment = () => {
        setAttachment(null);
        setAttachmentPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const renderMessageContent = (text: string) => {
        if (text.includes('<iframe')) {
            const parts = text.split(/(<iframe.*<\/iframe>)/s);
            return (
                <div>
                    <p>{parts[0]}</p>
                    <div className="audio-player-bubble" dangerouslySetInnerHTML={{ __html: parts[1] }} />
                </div>
            );
        }
        return <p>{text}</p>;
    };

    const renderChatView = () => (
        <>
            <div className="chatbot-messages no-scrollbar">
                {messages.map(msg => (
                    <div key={msg.id} className={`chat-message ${msg.sender === 'user' ? 'user' : 'ai'}`}>
                        <div className={`chat-avatar ${msg.sender} ${isLoading && msg.isStreaming ? 'thinking' : ''}`}>
                            {msg.sender === 'model' ? (
                                <img src="https://i.ibb.co/84G7YgJF/Icon-Avata-AI-Support-2.png" alt={pageData.avatarAlt} />
                            ) : (
                                <Icons.UserIcon className="user-icon-svg" />
                            )}
                        </div>
                        <div className={`message-bubble ${msg.isStreaming ? 'streaming' : ''}`}>
                            {msg.attachment && <img src={msg.attachment.url} alt="attachment" className="chat-attachment-image" />}
                            {renderMessageContent(msg.text)}
                        </div>
                        {(msg.sender === 'model' || msg.sender === 'user') && !msg.isStreaming && msg.text.trim() && isAiVoiceOn && (
                            <button
                                className="speak-message-btn"
                                onClick={() => {
                                    const voiceToUse = msg.sender === 'user' ? userVoiceName : aiVoiceToUse;
                                    if (isSpeaking) {
                                        cancel();
                                    } else {
                                        speak(msg.text, { voiceName: voiceToUse, lang: language, pitch: voiceToUse === aiVoiceToUse ? aiVoicePitch : undefined, rate: voiceToUse === aiVoiceToUse ? aiVoiceRate : undefined });
                                    }
                                }}
                                title={isSpeaking ? "Dừng" : "Nghe"}
                            >
                                {isSpeaking ? <Icons.PauseIcon size={18} /> : <Icons.SpeakerWaveIcon size={18} />}
                            </button>
                        )}
                    </div>
                ))}
                {isLoading && messages[messages.length-1]?.sender !== 'model' && (
                    <div className="chat-message ai">
                        <div className="chat-avatar thinking">
                           <img src="https://i.ibb.co/84G7YgJF/Icon-Avata-AI-Support-2.png" alt={pageData.avatarAlt} />
                        </div>
                        <div className="message-bubble">
                            <div className="typing-indicator"><span></span><span></span><span></span></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            {error && <div className="chat-error-message">{error}</div>}
        </>
    );

    const renderSuggestionsView = () => {
        const mediaPromptsToDisplay = (pageData.mediaPrompts as MediaPrompt[]).filter(prompt => {
            if (selectedCategory) {
                // When a category is selected, only show the 'back' button in the media prompts
                return prompt.action === 'show_categories';
            } else {
                // When no category is selected, show all prompts except the 'back' button
                return prompt.action !== 'show_categories';
            }
        });
        
        const [greeting, ...restOfWelcome] = pageData.welcomeMessage.split('!');
        const personalizedWelcomeMessage = language === 'vi'
            ? `${greeting} ${userSalutation} ${userName}!${restOfWelcome.join('!')}`
            : `${greeting} ${userName}!${restOfWelcome.join('!')}`;


        return (
            <div className="ai-suggestions-scroll-container no-scrollbar">
                <div className="ai-suggestions-view">
                    <div className="chat-message ai ai-welcome-message">
                        <div className="chat-avatar">
                            <img src="https://i.ibb.co/84G7YgJF/Icon-Avata-AI-Support-2.png" alt={pageData.avatarAlt} />
                        </div>
                        <div className="message-bubble">
                            <p>{personalizedWelcomeMessage}</p>
                            {isAiVoiceOn && (
                                <button 
                                    className="speak-message-btn-inline"
                                    onClick={() => {
                                        if (isSpeaking) {
                                            cancel();
                                        } else {
                                            speak(personalizedWelcomeMessage, { voiceName: aiVoiceToUse, lang: language, pitch: aiVoicePitch, rate: aiVoiceRate });
                                        }
                                    }}
                                    title={isSpeaking ? t.aiChatPage.speakerOn : t.aiChatPage.speakerOff}
                                >
                                    {isSpeaking ? <Icons.PauseIcon size={18} /> : <Icons.SpeakerWaveIcon size={18} />}
                                </button>
                            )}
                        </div>
                    </div>

                    {!selectedCategory ? (
                        null
                    ) : (
                        <div className="selected-category-view">
                            <h3>{selectedCategory.title}</h3>
                            <div className="suggested-prompts-container">
                                {selectedCategory.questions?.map((q, i) => {
                                    const hasAnswer = !!hardcodedAnswers[language][q.trim()];
                                    return (
                                        <button 
                                            key={i} 
                                            className={`suggested-prompt-btn ${!hasAnswer ? 'unanswered' : ''}`} 
                                            onClick={() => handleQuestionClick(q)}
                                        >
                                            <span>{q}</span>
                                            {!hasAnswer && <span className="unanswered-badge">{language === 'vi' ? 'Chưa trả lời' : 'No answer'}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                <div className="ai-media-prompts">
                    {mediaPromptsToDisplay.map(prompt => {
                        const Icon = Icons[prompt.icon];
                        return (
                            <button key={prompt.key} className="ai-media-prompt-btn" onClick={() => handleMediaPromptClick(prompt)}>
                                <Icon size={18} />
                                {prompt.title}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    const renderCollectInfoView = () => {
        const handleStart = (e: React.FormEvent) => {
            e.preventDefault();
            if (userName.trim() && userGender) {
                setView('categories');
            }
        };
        const initialWelcome = pageData.collectInfoGreeting;

        return (
            <div className="ai-suggestions-scroll-container no-scrollbar">
                <div className="ai-suggestions-view" style={{ justifyContent: 'center' }}>
                    <div className="chat-message ai ai-welcome-message">
                        <div className="chat-avatar">
                            <img src="https://i.ibb.co/84G7YgJF/Icon-Avata-AI-Support-2.png" alt={pageData.avatarAlt} />
                        </div>
                        <div className="message-bubble">
                            <p>{initialWelcome}</p>
                        </div>
                    </div>
    
                    <form onSubmit={handleStart} className="user-info-form">
                        <input 
                            type="text"
                            placeholder={pageData.namePlaceholder}
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                            aria-label="Your name"
                        />
                        <div className="gender-selector">
                            <button 
                                type="button"
                                className={userGender === 'Nam' ? 'active' : ''}
                                onClick={() => {
                                    setUserGender('Nam');
                                }}
                            >
                                {pageData.genderMale}
                            </button>
                            <button
                                type="button"
                                className={userGender === 'Nữ' ? 'active' : ''}
                                onClick={() => {
                                    setUserGender('Nữ');
                                }}
                            >
                                {pageData.genderFemale}
                            </button>
                        </div>
                        <button 
                            type="submit"
                            className="btn btn-primary"
                            disabled={!userName.trim() || !userGender}
                        >
                            {pageData.startChatBtn}
                        </button>
                    </form>
                </div>
            </div>
        );
    };
    
    const renderQuestionsPopup = () => {
        if (!isQuestionsPopupOpen) return null;

        const groups = questionGroups[language] || [];

        return (
            <div className="questions-popup-overlay" onClick={toggleQuestionsPopup}>
                <div className="questions-popup-content" onClick={(e) => e.stopPropagation()}>
                    <div className="questions-popup-header">
                        <div className="header-title-area">
                            {selectedGroup && (
                                <button className="back-btn" onClick={() => setSelectedGroup(null)}>
                                    <Icons.ChevronLeftIcon size={20} />
                                </button>
                            )}
                            <h3>{selectedGroup ? selectedGroup.title : pageData.questionsPopupTitle}</h3>
                        </div>
                        <button onClick={toggleQuestionsPopup}>
                            <Icons.XMarkIcon size={20} />
                        </button>
                    </div>
                    <div className="questions-list no-scrollbar">
                        {!selectedGroup ? (
                            groups.map((group, i) => (
                                <button 
                                    key={i} 
                                    className="question-item category-item"
                                    onClick={() => setSelectedGroup(group)}
                                >
                                    <span>{group.title}</span>
                                    <Icons.ChevronRightIcon size={16} />
                                </button>
                            ))
                        ) : (
                            selectedGroup.questions.map((q, i) => {
                                const hasAnswer = !!hardcodedAnswers[language][q.trim()];
                                return (
                                    <button 
                                        key={i} 
                                        className={`question-item ${!hasAnswer ? 'unanswered' : ''}`}
                                        onClick={() => handleQuestionClick(q)}
                                    >
                                        <span>{q}</span>
                                        {!hasAnswer && <span className="unanswered-badge">{language === 'vi' ? 'Chưa trả lời' : 'No answer'}</span>}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <PageLayout id={id}>
            <div className="info-card is-chat-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0, gap: '1rem' }}>
                    <InfoBadge
                        icon={<Icons.BotIcon />}
                        text={pageData.badge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <button onClick={startNewChat} className="header-icon-button" title={pageData.newChat}>
                            <Icons.PencilIcon size={22} />
                        </button>
                        <button onClick={() => setAiVoiceOn(!isAiVoiceOn)} className="header-icon-button" title={isAiVoiceOn ? pageData.speakerOn : pageData.speakerOff}>
                            {isAiVoiceOn ? <Icons.SpeakerWaveIcon size={22} /> : <Icons.SpeakerOffIcon size={22} />}
                        </button>
                    </div>
                </div>
                
                <div className="chat-interface-wrapper">
                    {view === 'collect_info' ? (
                        renderCollectInfoView()
                    ) : (
                        <>
                            {view === 'chat' || messages.length > 0 ? renderChatView() : renderSuggestionsView()}
                            
                            <div className="chatbot-input-area">
                                {showQuestionsBtn && !isLoading && (
                                    <button 
                                        className="suggested-questions-btn-toggle"
                                        onClick={toggleQuestionsPopup}
                                    >
                                        <Icons.ListIcon size={18} />
                                        {pageData.suggestedQuestionsBtn}
                                    </button>
                                )}
                                
                                {renderQuestionsPopup()}

                                {attachmentPreview && (
                                    <div className="attachment-preview">
                                        <img src={attachmentPreview} alt="attachment preview" />
                                        <button onClick={removeAttachment}><Icons.XMarkIcon size={14} /></button>
                                    </div>
                                )}
                                <form
                                    className="chatbot-input-form"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSend();
                                    }}
                                >
                                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAttachmentChange} style={{ display: 'none' }} />
                                    <button type="button" className="chatbot-attach-btn" title={pageData.attachFile} onClick={() => fileInputRef.current?.click()}>
                                        <Icons.AttachmentIcon />
                                    </button>
                                    <textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder={pageData.placeholder}
                                        className="chatbot-textarea no-scrollbar"
                                        rows={1}
                                    />
                                    <button
                                        type="submit"
                                        className="chatbot-send-btn"
                                        disabled={isLoading || (!input.trim() && !attachment)}
                                    >
                                        {isLoading ? <Icons.CpuIcon className="animate-spin" /> : <Icons.PaperAirplaneIcon />}
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default AiChatPage;