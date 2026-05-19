import { v4 as uuidv4 } from 'uuid';
import { IntakeContext, IntakeRequest } from '../../types/index.types';

const intakeById = new Map<string, IntakeContext>();

export const intakeStore = {
  create(input: IntakeRequest): IntakeContext {
    const intake: IntakeContext = {
      ...input,
      intakeId: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    intakeById.set(intake.intakeId, intake);
    return intake;
  },

  get(intakeId: string): IntakeContext | undefined {
    return intakeById.get(intakeId);
  },
};
