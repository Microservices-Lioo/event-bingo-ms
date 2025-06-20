import { StatusEvent } from "../enums";

export class Event {
    id: number;
    name: string;
    description: string;
    userId: number;
    status: StatusEvent;
    time: Date;
    start_time: Date;
    end_time: Date;
    val_cart: string;
}
