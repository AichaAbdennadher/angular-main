import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.css']
})
export class PostFormComponent implements OnChanges {

  @Input() categories: any[] = [];
  @Input() posting = false;
  @Input() error = '';

  @Output() submitPost = new EventEmitter<{
    titre: string;
    contenu: string;
    categorie_id: number;
    image: File | null;
  }>();

  @Output() cancel = new EventEmitter<void>();

  postData = {
    titre: '',
    contenu: '',
    categorie_id: 0
  };

  selectedFile: File | null = null;
  selectedFileName = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categories'] && this.categories.length > 0 && !this.postData.categorie_id) {
      this.postData.categorie_id = this.categories[0].id;
    }
  }
   formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';

    const date = new Date(dateString);

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) + ' à ' + date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    } else {
      this.selectedFile = null;
      this.selectedFileName = '';
    }
  }

  submit(): void {
    this.submitPost.emit({
      titre: this.postData.titre,
      contenu: this.postData.contenu,
      categorie_id: this.postData.categorie_id,
      image: this.selectedFile
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}