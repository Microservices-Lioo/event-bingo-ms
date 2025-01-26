import { StatusEvent } from "../enums";

export class Event {
    id: number;
    name: string;
    description: string;
    userId: number;
    status: StatusEvent;
    start_time: string;
    val_cart: string;
}
