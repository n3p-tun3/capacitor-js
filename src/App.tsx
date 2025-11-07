import { IonApp, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';

function App() {
  return (
    <IonApp>
      <IonHeader>
        <IonToolbar>
          <IonTitle className='p-4'>Hello Ionic + React!</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton expand="block" onClick={() => alert("Clicked!")}>
          <p className="text-lg font-bold">Click Me</p>
        </IonButton>
      </IonContent>
    </IonApp>
  );
}

export default App;
