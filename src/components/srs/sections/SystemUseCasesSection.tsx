import React from 'react';
import { Section, Subsection } from '../SectionHeading';
import { EditableText } from '../EditableText';
import { EditableList } from '../EditableList';

interface UseCase {
  name: string;
  identifier: string;
  description: string;
  actors: string[];
  preconditions: string;
  mainFlow: string[];
  alternativeFlow: string[];
}

interface SystemUseCasesSectionProps {
  useCases: UseCase[];
  isEditing: boolean;
  onUpdateUseCase: (index: number, useCase: UseCase) => void;
}

export const SystemUseCasesSection: React.FC<SystemUseCasesSectionProps> = ({
  useCases = [],
  isEditing,
  onUpdateUseCase
}) => {
  const safeUseCases = Array.isArray(useCases) ? useCases : [];

  return (
    <Section number="4" title="System Use Cases">
      {safeUseCases.length === 0 ? (
        <p className="text-slate-600 dark:text-slate-400">No use cases defined.</p>
      ) : (
        safeUseCases.map((useCase, index) => (
          <div key={index} className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
            <Subsection
              number={`4.${index + 1}`}
              title={`${useCase.name} (${useCase.identifier})`}
            >
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</h4>
                  <EditableText
                    value={useCase.description}
                    onChange={(val) =>
                      onUpdateUseCase(index, {
                        ...useCase,
                        description: val
                      })
                    }
                    isEditing={isEditing}
                    rows={3}
                  />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Actors</h4>
                  <EditableList
                    items={Array.isArray(useCase.actors) ? useCase.actors : []}
                    onChange={(val) =>
                      onUpdateUseCase(index, {
                        ...useCase,
                        actors: val
                      })
                    }
                    isEditing={isEditing}
                    buttonLabel="Add Actor"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Preconditions</h4>
                  <EditableText
                    value={useCase.preconditions}
                    onChange={(val) =>
                      onUpdateUseCase(index, {
                        ...useCase,
                        preconditions: val
                      })
                    }
                    isEditing={isEditing}
                    rows={2}
                  />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Main Flow</h4>
                  <EditableList
                    items={Array.isArray(useCase.mainFlow) ? useCase.mainFlow : []}
                    onChange={(val) =>
                      onUpdateUseCase(index, {
                        ...useCase,
                        mainFlow: val
                      })
                    }
                    isEditing={isEditing}
                    buttonLabel="Add Step"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Alternative Flow</h4>
                  <EditableList
                    items={Array.isArray(useCase.alternativeFlow) ? useCase.alternativeFlow : []}
                    onChange={(val) =>
                      onUpdateUseCase(index, {
                        ...useCase,
                        alternativeFlow: val
                      })
                    }
                    isEditing={isEditing}
                    buttonLabel="Add Alternative"
                  />
                </div>
              </div>
            </Subsection>
          </div>
        ))
      )}
    </Section>
  );
};

export default SystemUseCasesSection;
