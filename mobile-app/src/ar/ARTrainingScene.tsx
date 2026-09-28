import React, { useCallback, useRef, useState } from 'react';
import {
  ViroARScene,
  ViroARPlaneSelector,
  ViroNode,
  ViroBox,
  ViroSphere,
  ViroText,
  ViroMaterials,
  ViroAmbientLight,
  ViroTrackingStateConstants,
} from '@reactvision/react-viro';
import { useTrainingFlow, TrainingPhase } from './TrainingFlowContext';
import { getModuleArConfig, ArObjectConfig } from './moduleConfig';
import { useLocalization } from '../localization/LocalizationContext';

try {
  // Runs at module-import time (before ArExperienceScreen's readiness check
  // ever gets a chance to run), so guard it too — a broken/unlinked native
  // module should never crash bundle initialization.
  ViroMaterials.createMaterials({
    feedback_correct: { diffuseColor: '#2E7D32' },
    feedback_incorrect: { diffuseColor: '#C62828' },
  });
} catch (err) {
  console.warn('[ARTrainingScene] ViroMaterials.createMaterials failed:', err);
}

// One AR scene, not one per module — moduleConfig.ts supplies the objects,
// colours, and the single ar_task question each module grades via tap. A
// third safety domain only needs a new ModuleArConfig entry, not a new scene.
function ARTrainingSceneInner() {
  const { module, phase, hintsAllowed, recordAnswer } = useTrainingFlow();
  const { t } = useLocalization();
  const [placed, setPlaced] = useState(false);
  const [feedback, setFeedback] = useState<{ tagId: string; correct: boolean } | null>(null);
  const planeSelectorRef = useRef<any>(null);

  const config = module ? getModuleArConfig(module.moduleId) : null;

  const handlePlaneSelected = useCallback(() => {
    setPlaced(true);
  }, []);

  const handleObjectTap = useCallback(
    (obj: ArObjectConfig) => {
      if (!config) return;

      if (phase === TrainingPhase.Assessment) {
        // Only the AR-task question is graded via a tap; the other knowledge
        // questions are answered through AssessmentScreen's UI list.
        if (obj.tagId === config.arTaskCorrectTagId) {
          recordAnswer(config.arTaskQuestionId, 0);
        } else if (obj.practiceCorrect === false || obj.tagId !== config.arTaskCorrectTagId) {
          recordAnswer(config.arTaskQuestionId, 1);
        }
        return; // no visual feedback during formal assessment
      }

      setFeedback({ tagId: obj.tagId, correct: obj.practiceCorrect });
    },
    [config, phase, recordAnswer]
  );

  return (
    <ViroARScene
      anchorDetectionTypes={['PlanesHorizontal']}
      onAnchorFound={(a: any) => planeSelectorRef.current?.handleAnchorFound(a)}
      onAnchorUpdated={(a: any) => planeSelectorRef.current?.handleAnchorUpdated(a)}
      onAnchorRemoved={(a: any) => a && planeSelectorRef.current?.handleAnchorRemoved(a)}
      onTrackingUpdated={(state: any) => {
        if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) setPlaced(false);
      }}
    >
      <ViroAmbientLight color="#FFFFFF" intensity={300} />

      <ViroARPlaneSelector ref={planeSelectorRef} alignment="HorizontalUpward" onPlaneSelected={handlePlaneSelected}>
        {config?.objects.map((obj) => (
          <ViroNode key={obj.tagId} position={obj.offset}>
            {obj.shape === 'box' ? (
              <ViroBox
                height={0.2}
                width={0.2}
                length={0.2}
                materials={feedback?.tagId === obj.tagId ? [feedback.correct ? 'feedback_correct' : 'feedback_incorrect'] : undefined}
                onClick={() => handleObjectTap(obj)}
              />
            ) : (
              <ViroSphere
                radius={0.12}
                materials={feedback?.tagId === obj.tagId ? [feedback.correct ? 'feedback_correct' : 'feedback_incorrect'] : undefined}
                onClick={() => handleObjectTap(obj)}
              />
            )}
            {hintsAllowed && feedback?.tagId === obj.tagId && (
              <ViroText
                text={t(feedback.correct ? 'correct_feedback' : 'incorrect_feedback')}
                position={[0, 0.3, 0]}
                scale={[0.3, 0.3, 0.3]}
                style={{ color: '#FFFFFF', fontSize: 24 }}
              />
            )}
          </ViroNode>
        ))}
      </ViroARPlaneSelector>

      {!placed && (
        <ViroNode position={[0, 0, -1]}>
          <ViroText text={t('tap_to_place')} scale={[0.2, 0.2, 0.2]} style={{ color: '#FFFFFF', fontSize: 20 }} />
        </ViroNode>
      )}
    </ViroARScene>
  );
}

// ViroARSceneNavigator's initialScene.scene must be a zero-arg component
// reference — TrainingFlowProvider/LocalizationProvider already wrap the
// whole app (see App.tsx), so context is available here without re-wrapping.
export const ARTrainingScene = ARTrainingSceneInner;
