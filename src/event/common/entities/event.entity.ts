import { StatusEvent } from "../enums";

export class IEvent {
    id: string;
    name: string;
    description: string;
    userId: string;
    status: StatusEvent;
    price: number;
    start_time: Date;
    end_time: Date;
    host_is_active: boolean;
}
