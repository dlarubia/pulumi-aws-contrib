import { MetricAlarm } from '@pulumi/aws/cloudwatch';

import type { AlarmStore } from './alarm-store';
import type { AlarmStoreCommand } from './alarm-store-command';

export abstract class CreateAlarmCommand implements AlarmStoreCommand {
    abstract execute(ctx?: AlarmStore): MetricAlarm;
}
