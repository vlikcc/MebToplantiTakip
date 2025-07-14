<?php

namespace App\Config;

use Illuminate\Database\Capsule\Manager as Capsule;

class Database
{
    private $capsule;

    public function __construct()
    {
        $this->capsule = new Capsule;

        $this->capsule->addConnection([
            'driver'    => $_ENV['DB_CONNECTION'] ?? 'mysql',
            'host'      => $_ENV['DB_HOST'] ?? '127.0.0.1',
            'port'      => $_ENV['DB_PORT'] ?? 3306,
            'database'  => $_ENV['DB_DATABASE'] ?? 'meb_toplanti_takip',
            'username'  => $_ENV['DB_USERNAME'] ?? 'root',
            'password'  => $_ENV['DB_PASSWORD'] ?? '',
            'charset'   => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix'    => '',
        ]);

        $this->capsule->setAsGlobal();
        $this->capsule->bootEloquent();
    }

    public function getConnection()
    {
        return $this->capsule->getConnection();
    }

    public function createTables()
    {
        $schema = $this->capsule->schema();

        // Users tablosu
        if (!$schema->hasTable('Users')) {
            $schema->create('Users', function ($table) {
                $table->increments('UserId');
                $table->string('DeviceId')->unique();
                $table->string('UserName');
                $table->string('InstitutionName');
                $table->timestamp('LastLoginDate');
                $table->timestamps();
            });
        }

        // Locations tablosu
        if (!$schema->hasTable('Locations')) {
            $schema->create('Locations', function ($table) {
                $table->increments('LocationId');
                $table->double('Latitude');
                $table->double('Longitude');
                $table->string('LocationName');
                $table->timestamps();
            });
        }

        // Meetings tablosu
        if (!$schema->hasTable('Meetings')) {
            $schema->create('Meetings', function ($table) {
                $table->increments('MeetingId');
                $table->string('Title');
                $table->string('StartDate');
                $table->string('EndDate');
                $table->string('Allday');
                $table->string('Color');
                $table->unsignedInteger('LocationId')->nullable();
                $table->timestamps();
                
                $table->foreign('LocationId')->references('LocationId')->on('Locations');
            });
        }

        // Attendees tablosu
        if (!$schema->hasTable('Attendees')) {
            $schema->create('Attendees', function ($table) {
                $table->increments('Id');
                $table->unsignedInteger('MeetingId');
                $table->unsignedInteger('UserId');
                $table->timestamps();
                
                $table->foreign('MeetingId')->references('MeetingId')->on('Meetings');
                $table->foreign('UserId')->references('UserId')->on('Users');
                $table->unique(['MeetingId', 'UserId']);
            });
        }

        // MeetingDocuments tablosu
        if (!$schema->hasTable('MeetingDocuments')) {
            $schema->create('MeetingDocuments', function ($table) {
                $table->increments('Id');
                $table->unsignedInteger('MeetingId');
                $table->string('FileName');
                $table->string('FilePath');
                $table->string('DownloadUrl')->nullable();
                $table->timestamps();
                
                $table->foreign('MeetingId')->references('MeetingId')->on('Meetings');
            });
        }
    }
} 