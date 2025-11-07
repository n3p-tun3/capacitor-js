import { useState, useEffect } from 'react';
import {
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonPage,
  IonFab,
  IonFabButton,
  IonIcon,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonToast,
} from '@ionic/react';
import { add, trash } from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import { IonAlert } from '@ionic/react';

type Todo = {
  id: string;
  text: string;
  done: boolean;
};

export default function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([
    ]);
    const [webToast, setWebToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });
    const [addAlertOpen, setAddAlertOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await Preferences.get({ key: 'todos' });
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          if (mounted && Array.isArray(parsed)) {
            setTodos(parsed);
            return;
          }
        }
      } catch (e) {
        // ignore and try localStorage fallback
      }

      try {
        const v = localStorage.getItem('todos');
        if (v) {
          const parsed = JSON.parse(v);
          if (mounted && Array.isArray(parsed)) setTodos(parsed);
        }
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const saveTodos = async (next: Todo[]) => {
    try {
      await Preferences.set({ key: 'todos', value: JSON.stringify(next) });
    } catch (e) {
      try {
        localStorage.setItem('todos', JSON.stringify(next));
      } catch (_err) {
        // ignore
      }
    }
  };

  const showToast = async (text: string) => {
    // Always use IonToast for feedback in the app UI (native plugin removed per request)
    setWebToast({ show: true, msg: text });
  };


  const toggle = async (id: string) => {
    setTodos((prev) => {
      const next = prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it));
      // persist
      saveTodos(next);
      return next;
    });
    // compute message based on current known value in state before update
    const current = todos.find((x) => x.id === id);
    const willBeDone = current ? !current.done : true;
    await showToast(willBeDone ? 'Marked complete' : 'Marked active');
  };

  const remove = async (id: string) => {
    setTodos((prev) => {
      const next = prev.filter((it) => it.id !== id);
      saveTodos(next);
      return next;
    });
    await showToast('Deleted');
  };

  const onAdd = async () => {
    // show add alert to get text
    setAddAlertOpen(true);
  };


  const addTodo = async (text?: string | null) => {
    const trimmed = (text ?? '').toString().trim();
    if (!trimmed) {
      setAddAlertOpen(false);
      return;
    }
    const newTodo = { id: String(Date.now()), text: trimmed, done: false } as Todo;
    setTodos((prev) => {
      const next = [newTodo, ...prev];
      saveTodos(next);
      return next;
    });
    setAddAlertOpen(false);
    await showToast('Added');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className='px-4 text-center'>Todos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          {todos.length === 0 ? (
            <IonItem>
              <div className="w-full bg-white/90 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">No todos yet</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Get started with these quick actions — tap the buttons or use gestures shown below.
                </p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>
                    <span className="font-medium">Add:</span> Tap the{' '}
                    <span className="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-0.5 rounded">+</span>{' '}
                    button at the bottom-right, type a short description and press <span className="font-semibold">Add</span>.
                  </li>
                  <li>
                    <span className="font-medium">Mark done / undone:</span> Tap the item or the checkbox to toggle its state. Done items have a
                    strikethrough.
                  </li>
                  <li>
                    <span className="font-medium">Delete:</span> Swipe the item to reveal the trash icon and tap it to remove the todo.
                  </li>
                </ul>
                <p className="mt-3 text-sm text-gray-500 italic">
                  Example: Add "Buy milk", tap it to mark done, or swipe to delete.
                </p>
              </div>
            </IonItem>
          ) : (
            todos.map((todo) => (
              <IonItemSliding key={todo.id}>
                <IonItem onClick={() => toggle(todo.id)}>
                  <IonCheckbox slot="start" checked={todo.done} />
                  <IonLabel className='px-2' style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
                    {todo.text}
                  </IonLabel>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption color="danger" onClick={() => remove(todo.id)}>
                    <IonIcon icon={trash} />
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))
          )}
        </IonList>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={onAdd} title="Add">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
        <IonAlert
          isOpen={addAlertOpen}
          header="Add todo"
          inputs={[{ name: 'text', type: 'text', placeholder: 'What do you want to do?' }]}
          buttons={[
            { text: 'Cancel', role: 'cancel', handler: () => setAddAlertOpen(false) },
            { text: 'Add', role: 'confirm', handler: (data) => addTodo(data.text) },
          ]}
        />
        <IonToast
          isOpen={webToast.show}
          message={webToast.msg}
          duration={2000}
          onDidDismiss={() => setWebToast({ show: false, msg: '' })}
        />
      </IonContent>
    </IonPage>
  );
}
