terraform {
  backend "gcs" {
    bucket = "pluto01pr"
    prefix = "test"
  }
}

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "7.46.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

resource "google_storage_bucket" "randombucket13377" {
  name                        = "randombucket13377"
  location                    = var.region
  storage_class               = "STANDARD"
  uniform_bucket_level_access = true

  force_destroy = true
}

resource "google_compute_instance" "linux-machine" {
  name         = "linux-machine"
  machine_type = "e2-micro"
  zone         = var.zone

  can_ip_forward      = false
  deletion_protection = false

  boot_disk {
    auto_delete = true
    device_name = "linux-machine"

    initialize_params {
      image = "projects/debian-cloud/global/images/debian-13-trixie-v20260827"
      size  = 10
      type  = "pd-balanced"
    }
  }

  network_interface {
    network    = "default"
    subnetwork = "projects/${var.project_id}/regions/${var.region}/subnetworks/default"

    access_config {
      nat_ip       = data.google_compute_address.my_ip.address
      network_tier = "PREMIUM"
    }
  }

  metadata = {
    ssh-keys = "${var.ssh_user}:${file(var.ssh_pub_key_path)}"
  }

  scheduling {
    automatic_restart   = true
    on_host_maintenance = "MIGRATE"
    preemptible         = false
    provisioning_model  = "STANDARD"
  }

  service_account {
    email = "251646188810-compute@developer.gserviceaccount.com"
    scopes = [
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring.write",
      "https://www.googleapis.com/auth/service.management.readonly",
      "https://www.googleapis.com/auth/servicecontrol",
      "https://www.googleapis.com/auth/trace.append"
    ]
  }

  tags = ["http-server", "https-server", "allow-ssh"]
}

data "google_compute_address" "my_ip" {
  name   = "my-terraform-instance-ip"
  region = var.region
}