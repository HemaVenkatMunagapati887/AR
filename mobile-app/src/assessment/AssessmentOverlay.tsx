import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../components/ui';
import { useLocalization } from '../localization/LocalizationContext';
import { useTrainingFlow } from '../ar/TrainingFlowContext';
import { localize } from '../types/models';

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ArExperience'>;
}

/**
 * Drives the no-hints assessment phase for mcq/scenario/ordering questions
 * through this overlay; ar_task questions are skipped here and instead
 * resolved by an AR tap in ARTrainingScene, which calls recordAnswer() and
 * is picked up by the answeredQuestionIds watcher below. One overlay serves
 * every module — see TrainingFlowContext for why question-type logic isn't
 * duplicated per module.
 */
export function AssessmentOverlay({ navigation }: Props) {
  const { t, language } = useLocalization();
  const { module, answeredQuestionIds, recordAnswer, submitAssessment } = useTrainingFlow();
  const [orderingSelection, setOrderingSelection] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const questions = module?.questions ?? [];
  const currentIndex = questions.findIndex((q) => !answeredQuestionIds.has(q.questionId));
  const current = currentIndex >= 0 ? questions[currentIndex] : null;

  useEffect(() => {
    setOrderingSelection([]);
  }, [current?.questionId]);

  useEffect(() => {
    if (!module) return;
    const allAnswered = questions.length > 0 && questions.every((q) => answeredQuestionIds.has(q.questionId));
    if (allAnswered && !submitting) {
      setSubmitting(true);
      submitAssessment().then(() => navigation.replace('Result'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answeredQuestionIds, module]);

  const progressLabel = useMemo(() => `${Math.min(currentIndex + 1, questions.length)} / ${questions.length}`, [currentIndex, questions.length]);

  if (!module) return null;

  if (submitting || !current) {
    return (
      <View style={styles.card}>
        <Text style={styles.notice}>{t('assessment_no_hints_notice')}</Text>
      </View>
    );
  }

  if (current.questionType === 'ar_task') {
    return (
      <View style={styles.card}>
        <Text style={styles.progress}>{progressLabel}</Text>
        <Text style={styles.question}>{localize(current.question, language)}</Text>
      </View>
    );
  }

  function handleMcqSelect(optionIndex: number) {
    recordAnswer(current!.questionId, optionIndex);
  }

  function handleOrderingTap(optionIndex: number) {
    if (orderingSelection.includes(optionIndex)) return;
    const next = [...orderingSelection, optionIndex];
    setOrderingSelection(next);
    if (next.length === current!.options.length) {
      recordAnswer(current!.questionId, next);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.notice}>{t('assessment_no_hints_notice')}</Text>
      <Text style={styles.progress}>{progressLabel}</Text>
      <Text style={styles.question}>{localize(current.question, language)}</Text>

      {current.options.map((opt, i) => {
        const orderPosition = orderingSelection.indexOf(i);
        const isOrdering = current.questionType === 'ordering';
        return (
          <Pressable
            key={i}
            style={[styles.option, isOrdering && orderPosition >= 0 && styles.optionSelected]}
            onPress={() => (isOrdering ? handleOrderingTap(i) : handleMcqSelect(i))}
            disabled={isOrdering && orderPosition >= 0}
          >
            <Text style={styles.optionText}>
              {isOrdering && orderPosition >= 0 ? `${orderPosition + 1}. ` : ''}
              {localize(opt, language)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(17,24,39,0.95)', borderRadius: 16, padding: 18, maxHeight: '70%' },
  notice: { color: '#F59E0B', fontSize: 12, marginBottom: 6 },
  progress: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  question: { color: COLORS.text, fontSize: 17, fontWeight: '600', marginBottom: 12 },
  option: { backgroundColor: COLORS.card, borderRadius: 10, padding: 14, marginBottom: 8 },
  optionSelected: { backgroundColor: '#374151' },
  optionText: { color: COLORS.text, fontSize: 15 },
});
