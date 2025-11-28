import { EMAIL_TYPES } from "../constants/emailTypes.js";
import { sendEmail } from "../utils/sendEmail.js";

const PRIORITY = {
  IMMEDIATE: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
};

const EMAIL_PRIORITY_MAP = {
  [EMAIL_TYPES.VERIFICATION_CODE]: PRIORITY.IMMEDIATE,
  [EMAIL_TYPES.PASSWORD_RESET]: PRIORITY.IMMEDIATE,
  [EMAIL_TYPES.VERIFICATION_LINK]: PRIORITY.HIGH,
  [EMAIL_TYPES.RESERVATION_CREATED]: PRIORITY.NORMAL,
  [EMAIL_TYPES.RESERVATION_STATUS]: PRIORITY.NORMAL,
  [EMAIL_TYPES.RESERVATION_COMPLETED]: PRIORITY.NORMAL,
};

class EmailDispatcher {
  constructor() {
    this.queue = [];
    this.active = 0;
    this.maxConcurrent = 4;
  }

  enqueue(job) {
    const priority =
      job.priority ||
      EMAIL_PRIORITY_MAP[job.type] ||
      PRIORITY.NORMAL;

    const entry = {
      ...job,
      priority,
      createdAt: Date.now(),
      fireAndForget: job.fireAndForget || false,
    };

    if (entry.fireAndForget) {
      this.queue.push(entry);
      this.sortQueue();
      this.processQueue();
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      entry.resolve = resolve;
      entry.reject = reject;
      this.queue.push(entry);
      this.sortQueue();
      this.processQueue();
    });
  }

  sortQueue() {
    this.queue.sort(
      (a, b) =>
        a.priority - b.priority || a.createdAt - b.createdAt
    );
  }

  processQueue() {
    while (
      this.active < this.maxConcurrent &&
      this.queue.length > 0
    ) {
      const job = this.queue.shift();
      if (!job) break;
      this.active += 1;
      this.execute(job)
        .then((info) => {
          if (!job.fireAndForget && job.resolve) {
            job.resolve(info);
          }
        })
        .catch((error) => {
          if (!job.fireAndForget && job.reject) {
            job.reject(error);
          } else {
            console.error(
              `❌ Email job failed (type: ${job.type || "unknown"}):`,
              error.message
            );
          }
        })
        .finally(() => {
          this.active -= 1;
          this.processQueue();
        });
    }
  }

  async execute(job) {
    return sendEmail(
      job.to,
      job.subject,
      job.html,
      job.retries ?? 2
    );
  }
}

const dispatcher = new EmailDispatcher();

export const dispatchEmail = (job) => dispatcher.enqueue(job);

