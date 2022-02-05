export class TaskData {
  task_map = new Map();
  my_idx = 1;

  constructor({ current_user_id }) {
    this.me = current_user_id;
  }

  get_widget_data() {
    const all_tasks = Array.from(this.task_map.values());
    // all_tasks.sort((a, b) => util.strcmp(a.task, b.task));

    const pending_tasks = [];
    const completed_tasks = [];

    for (const item of all_tasks) {
      if (item.completed) {
        completed_tasks.push(item);
      } else {
        pending_tasks.push(item);
      }
    }

    const widget_data = {
      pending_tasks,
      completed_tasks,
    };

    return widget_data;
  }

  name_in_use(name) {
    for (const item of this.task_map.values()) {
      if (item.task === name) {
        return true;
      }
    }

    return false;
  }

  handle = {
    new_task: {
      outbound: (task, desc) => {
        this.my_idx += 1;
        const event = {
          type: 'new_task',
          key: this.my_idx,
          task,
          desc,
          completed: false,
        };

        if (!this.name_in_use(task)) {
          return event;
        }
        return undefined;
      },

      inbound: (sender_id, data) => {
        // All messages readers may add tasks.
        // for legacy reasons, the inbound idx is
        // called key in the event
        const idx = data.key;
        const task = data.task;
        const desc = data.desc;

        if (!Number.isInteger(idx) || idx < 0 || idx > 1000) {
          console.log('todo widget: bad type for inbound task idx');
          return;
        }

        if (typeof task !== 'string') {
          console.log('todo widget: bad type for inbound task title');
          return;
        }

        if (typeof desc !== 'string') {
          console.log('todo widget: bad type for inbound task desc');
          return;
        }

        const key = `${idx},${sender_id}`;
        const completed = data.completed;

        const task_data = {
          task,
          desc,
          idx,
          key,
          completed,
        };

        if (!this.name_in_use(task)) {
          this.task_map.set(key, task_data);
        }

        // I may have added a task from another device.
        if (sender_id === this.me && this.my_idx <= idx) {
          this.my_idx = idx + 1;
        }
      },
    },

    strike: {
      outbound: key => {
        const event = {
          type: 'strike',
          key,
        };

        return event;
      },

      inbound: (sender_id, data) => {
        // All message readers may strike/unstrike todo tasks.
        const key = data.key;
        if (typeof key !== 'string') {
          console.log('todo widget: bad type for inbound strike key');
          return;
        }

        const item = this.task_map.get(key);

        if (item === undefined) {
          console.log(`Do we have legacy data? unknown key for tasks: ${key}`);
          return;
        }

        item.completed = !item.completed;
      },
    },
  };

  handle_event(sender_id, data) {
    const type = data.type;
    if (this.handle[type] && this.handle[type].inbound) {
      this.handle[type].inbound(sender_id, data);
    } else {
      console.log(`todo widget: unknown inbound type: ${type}`);
    }
  }
}
