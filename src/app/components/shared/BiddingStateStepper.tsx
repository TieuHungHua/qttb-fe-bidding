import { Check, Circle } from 'lucide-react';
import { cn } from '../ui/utils';
import { BIDDING_STATES } from '../../lib/constants';
import { formatDate } from '../../lib/utils';
import type { BiddingState, StateHistory } from '../../lib/types';

interface BiddingStateStepperProps {
  currentState: BiddingState;
  stateHistory: StateHistory[];
  className?: string;
}

export function BiddingStateStepper({ currentState, stateHistory, className }: BiddingStateStepperProps) {
  const orderedStates: BiddingState[] = [
    'draft',
    'pending_approval',
    'approved_hsmt',
    'published',
    'bidding_open',
    'bidding_closed',
    'evaluation',
    'evaluation_complete',
    'evaluation_approved',
    'standstill',
    'complaint_period',
    'complaint_resolved',
    'winner_announced',
    'contract_pending',
    'contract_signed',
  ];

  const currentStateIndex = orderedStates.indexOf(currentState);
  const isCancelled = currentState === 'cancelled';

  const getStateStatus = (state: BiddingState, index: number) => {
    if (isCancelled) {
      return stateHistory.some(h => h.state === state) ? 'completed' : 'pending';
    }

    if (state === currentState) return 'current';
    if (index < currentStateIndex) return 'completed';
    return 'pending';
  };

  const getStateDate = (state: BiddingState) => {
    const history = stateHistory.find(h => h.state === state);
    return history ? formatDate(history.changedAt) : null;
  };

  return (
    <div className={cn('space-y-1', className)}>
      {orderedStates.map((state, index) => {
        const status = getStateStatus(state, index);
        const stateConfig = BIDDING_STATES[state];
        const date = getStateDate(state);

        return (
          <div key={state} className="flex items-start gap-3 relative">
            {/* Connector Line */}
            {index < orderedStates.length - 1 && (
              <div
                className={cn(
                  'absolute left-[11px] top-6 w-0.5 h-full',
                  status === 'completed' ? 'bg-green-500' : 'bg-muted'
                )}
              />
            )}

            {/* Step Circle */}
            <div className="relative z-10">
              {status === 'completed' ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                  <Check className="h-4 w-4 text-white" />
                </div>
              ) : status === 'current' ? (
                <div className="relative flex h-6 w-6 items-center justify-center">
                  <div className="absolute h-6 w-6 rounded-full bg-primary/20 animate-ping" />
                  <Circle className="h-6 w-6 fill-primary text-primary" />
                </div>
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground/50" />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 pb-4 pt-0.5">
              <div className={cn(
                'font-medium text-sm',
                status === 'completed' && 'text-green-600',
                status === 'current' && 'text-primary font-semibold',
                status === 'pending' && 'text-muted-foreground'
              )}>
                {stateConfig.order}. {stateConfig.label}
              </div>
              {date && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {date}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Cancelled State (if applicable) */}
      {isCancelled && (
        <div className="flex items-start gap-3 relative">
          <div className="relative z-10">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
              <span className="text-white text-xs font-bold">✕</span>
            </div>
          </div>
          <div className="flex-1 pb-4 pt-0.5">
            <div className="font-medium text-sm text-red-600">
              16. Đã hủy
            </div>
            {getStateDate('cancelled') && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {getStateDate('cancelled')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
